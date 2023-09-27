/**
 * Steps to add a new Connection field:
 * Let's assume the Connection type you want to add is `AxinomConnection`
 * 1. Add `AxinomConnection` type to below `ConnectionType`
 * 2. Add new Map into `connectionInputTypes` below, in this case, which will be `AxinomConnection: { orderBy: ['id'] }`
 * 3. Add the column names you want to add to orderBy into the orderBy array
 * 4. Optionally you can set a default value to `first` argument using `defaultFirst` below
 * 5. When you are extending the schema to add the field which returns `AxinomConnection`, remember to return `paginate()` which is declared here 'src/common/utils/plans-connection.ts'
 */

export type ConnectionType = 'VideosConnection' | 'CollectionsConnection';

export const orderByInputTypePostfix = 'OrderByInput';

export const connectionInputTypes: {
  [key: string]: { defaultFirst?: number; orderBy: string[] };
} = {
  VideosConnection: {
    defaultFirst: 100,
    orderBy: ['id', 'url'],
  },
  CollectionsConnection: {
    defaultFirst: 100,
    orderBy: ['id', 'title'],
  },
};
