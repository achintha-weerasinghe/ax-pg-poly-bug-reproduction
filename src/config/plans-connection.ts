import { PgSelectStep } from 'postgraphile/@dataplan/pg';
import { ConnectionStep, FieldArgs, __InputStaticLeafStep, connection } from 'postgraphile/grafast';

/**
 * GQL Plan step to paginate a query
 * @param $plan - the plan to paginate
 * @param fieldArgs - the arguments passed to the field
 */
export const paginate = ($plan: PgSelectStep, fieldArgs: FieldArgs): ConnectionStep<any, any, any, any> => {
  const orderBy: Record<string, 'ASC' | 'DESC'> = fieldArgs.getRaw(['orderBy']).eval();
  if (orderBy) {
    for (const [attribute, direction] of Object.entries(orderBy)) {
      $plan.orderBy({ attribute, direction });
    }
  }

  const $parsedCursor = $plan.parseCursor(fieldArgs.getRaw(['after']) as __InputStaticLeafStep<string>);
  if ($parsedCursor) {
    $plan.setAfter($parsedCursor);
  }

  $plan.setOffset(fieldArgs.getRaw(['offset']));
  $plan.setFirst(fieldArgs.getRaw(['first']));

  return connection($plan);
};
