# ax-poly-poc

Steps:

1. Create a db named ax_media satisfying this connection string (postgres://postgres:postgres@localhost:5432/ax_media) and run `db-schema.sql` file in the root.

2. Run `yarn start`

3. Till you are not querying any of the `VideosConnection` type fields, everything works.

4. Use the below query to get the error

```graphql
query MyQuery {
  collections {
    edges {
      node {
        __typename
        title
        type
        ... on CollectionMovie {
          title
          trailers {
            edges {
              node {
                url
                type
              }
            }
          }
        }
        ... on CollectionSeason {
          countSeasons
          title
        }
      }
    }
  }
}
```
