import { GraphQLError } from 'graphql';
import { FieldArgs, lambda } from 'postgraphile/grafast';
import { makeWrapPlansPlugin } from 'postgraphile/utils';

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
