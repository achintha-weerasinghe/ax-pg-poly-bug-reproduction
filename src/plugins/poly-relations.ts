import { gql, makeExtendSchemaPlugin } from 'postgraphile/utils';

/**
 * Smart tags allow you to customize the generated GraphQL schema without making breaking changes to your database.
 * This plugin adds a `episodes`, `extras` and 'trailer' fields to the `SmartCollection` type.
 * These fields are connections to the `Video` type with custom conditions.
 * episodes - all videos with `content_type` = 'episode' and `collection_parent_id` = smartCollection.id
 * extras - all videos with `content_type` = 'extra' and `parent_id` = smartCollection.id
 * trailer - all videos with `content_type` = 'trailer' and `parent_id` = smartCollection.id
 */

export const polyRelationsPlugin = makeExtendSchemaPlugin((build) => {
    const {
        grafast: { connection },
        input: { pgRegistry },
    } = build;
    const { episodes } = pgRegistry.pgResources; // 'video' - must match the name of the related table in the database!
    return {
        typeDefs: gql`
      extend type CollectionSeason {
        episodes: EpisodesConnection
        trailers: EpisodesConnection
      }

      extend type CollectionMovie {
        trailers: EpisodesConnection
      }
    `,
        plans: {
            CollectionSeason: {
                episodes($collection) {
                    const $episodes = episodes.find({
                        collection_id: $collection.get('id'),
                    });
                    return connection($episodes);
                },
                trailers($collection) {
                    const $trailers = episodes.find({
                        collection_id: $collection.get('id'),
                    });
                    return connection($trailers);
                },
            },
            CollectionMovie: {
                trailers($collection) {
                    const $trailers = episodes.find({
                        collection_id: $collection.get('id'),
                    });
                    return connection($trailers);
                },
            },
        },
    };
});
