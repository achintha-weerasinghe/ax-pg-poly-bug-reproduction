import { GraphQLError } from 'graphql';
import { FieldArgs, lambda } from 'postgraphile/grafast';
import { makeWrapPlansPlugin } from 'postgraphile/utils';

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
const connections = ['VideosConnection', 'CollectionsConnection'];

// Validation of args
export const paginationWrapPlugin: GraphileConfig.Plugin =
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
