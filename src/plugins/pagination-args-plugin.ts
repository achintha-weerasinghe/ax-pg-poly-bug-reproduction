import { GraphQLError, GraphQLString } from 'graphql';
import { FieldArgs, GrafastInputFieldConfigMap, lambda } from 'postgraphile/grafast';
import { makeWrapPlansPlugin } from 'postgraphile/utils';
import { ConnectionType, connectionInputTypes, orderByInputTypePostfix } from '../config';

interface ExtendedBuild {
  axValidateArgsOnTypes: {
    self: string;
    fieldName: string;
    type: ConnectionType;
  }[];
}

/**
 * The validate function is used to validate the arguments passed to a GraphQL field. It takes in the field arguments,
 * a list of argument names to validate, and a validator function as inputs.
 * @param fieldArgs - The field arguments passed to the GraphQL field
 * @param args - A list of argument names to validate
 * @param validator - A function that performs the validation logic on each argument
 */
const validate = (fieldArgs: FieldArgs, args: string[], validator: (arg: any) => void): void => {
  args.forEach((argName) => {
    const $checkArg = lambda(fieldArgs.getRaw(argName), validator);
    $checkArg.hasSideEffects = true;
  });
};

const pageSizeArgs = ['first', 'last'];
const connections = Object.keys(connectionInputTypes);

// Validation of args
const paginationWrapPlugin = (): GraphileConfig.Plugin =>
  makeWrapPlansPlugin(
    (context, build, field) => {
      if (field.type.name && connections.includes(field.type.name)) {
        return true;
      }

      return null;
    },
    () => (plan, $source, fieldArgs) => {
      validate(fieldArgs, pageSizeArgs, (arg) => {
        if (arg < 1 || arg > 100) {
          throw new GraphQLError(`Invalid argument: Must be a positive integer between 1 to 100`);
        }
      });

      return plan();
    },
  );

// Manipulating the schema for args
const paginationArgsPlugin = (): GraphileConfig.Plugin => ({
  name: 'PaginationArgsPlugin',
  version: '0.0.0',
  schema: {
    hooks: {
      // Extending build object with a custom property to share values between hooks
      build(build) {
        const extended: ExtendedBuild = {
          axValidateArgsOnTypes: [],
        };
        return build.extend(build, extended, 'pagination arguments validation extension');
      },
      // Register orderBy input types for each connection type
      init(_, build) {
        const {
          graphql: { getNullableType },
          registerInputObjectType,
          getInputTypeByName,
        } = build;

        Object.entries(connectionInputTypes).forEach(([type, extra]) => {
          registerInputObjectType(
            `${type}${orderByInputTypePostfix}`,
            { isInputType: true },
            () => ({
              fields: () => {
                const fields: GrafastInputFieldConfigMap<any, any> = {};
                return extra.orderBy.reduce(
                  (prev, col) => ({
                    ...prev,
                    [col]: { type: getNullableType(getInputTypeByName('OrderByDirection')) },
                  }),
                  fields,
                );
              },
            }),
            `${type} custom orderBy input automated`,
          );
        });

        return _;
      },
      // Find fields with type is either VideosConnection or SmartCollectionsConnection
      // and adding them to the build object to later use in other hooks
      GraphQLObjectType_fields_field(field, build, context) {
        const extendedBuild = build as GraphileBuild.Build & ExtendedBuild;

        if (connections.includes(field.type.name)) {
          extendedBuild.axValidateArgsOnTypes.push({
            self: context.Self.name,
            fieldName: context.scope.fieldName,
            type: field.type.name,
          });
        }

        return field;
      },
      // Add first, offset and orderBy args to the fields found in above hook
      // Exclude root Query fields (Those fields has postgraphile default inputs)
      GraphQLObjectType_fields_field_args(args, build, context) {
        const {
          graphql: { getNullableType, GraphQLInt },
          getInputTypeByName,
        } = build;

        const extendedBuild = build as GraphileBuild.Build & ExtendedBuild;

        const validateArg = extendedBuild.axValidateArgsOnTypes.find(
          (t) => t.self === context.Self.name && t.fieldName === context.scope.fieldName,
        );

        if (validateArg) {
          return {
            ...args,
            first: { type: getNullableType(GraphQLInt) },
            offset: { type: getNullableType(GraphQLInt) },
            after: { type: getNullableType(GraphQLString) },
            orderBy: { type: getNullableType(getInputTypeByName(`${validateArg.type}${orderByInputTypePostfix}`)) },
          };
        }

        return args;
      },
      // Setting the default for the first/last input args
      GraphQLObjectType_fields_field_args_arg(arg, build, context) {
        const extendedBuild = build as GraphileBuild.Build & ExtendedBuild;

        const validateArg = extendedBuild.axValidateArgsOnTypes.find(
          (t) => t.self === context.Self.name && t.fieldName === context.scope.fieldName,
        );

        if (validateArg && pageSizeArgs.includes(context.scope.argName)) {
          // arg.type = new GraphQLNonNull(getNullableType(arg.type)); // To make it non-nullable
          arg.defaultValue = connectionInputTypes[validateArg.type].defaultFirst;
        }

        return arg;
      },
    },
  },
});

// Both the plugins are required and serve together for the same purpose
export const paginationArgsPlugins: GraphileConfig.Plugin[] = [paginationArgsPlugin(), paginationWrapPlugin()];
