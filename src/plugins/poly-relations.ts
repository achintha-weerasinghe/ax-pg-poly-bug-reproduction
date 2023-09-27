import { gql, makeExtendSchemaPlugin } from 'postgraphile/utils';
import { paginate } from '../config';

export const polyRelationsPlugin = makeExtendSchemaPlugin((build) => {
    const {
        sql,
        grafast: { connection },
        input: { pgRegistry },
    } = build;
    const { videos, collections } = pgRegistry.pgResources; // 'video' - must match the name of the related table in the database!
    return {
        typeDefs: gql`
            enum OrderByDirection {
                ASC
                DESC
            }
            
            extend type CollectionSeason {
                episodes: VideosConnection
                trailers: VideosConnection
            }

            extend type CollectionMovie {
                trailers: VideosConnection
            }

            extend type Query {
                collections: CollectionsConnection
            }
        `,
        plans: {
            CollectionSeason: {
                episodes($collection, fieldArgs) {
                    const $videos = videos.find({
                        collection_id: $collection.get('id'),
                    });
                    $videos.where(sql`${$videos.alias}.type = 'episode'`);
                    return connection($videos);
                },
                trailers($collection, fieldArgs) {
                    const $videos = videos.find({
                        collection_id: $collection.get('id'),
                    });
                    $videos.where(sql`${$videos.alias}.type = 'trailer'`);
                    return connection($videos);
                },
            },
            CollectionMovie: {
                trailers($collection, fieldArgs) {
                    const $videos = videos.find({
                        collection_id: $collection.get('id'),
                    });
                    $videos.where(sql`${$videos.alias}.type = 'trailer'`);
                    return connection($videos);
                },
            },
            Query: {
                collections(_, fieldArgs) {
                    const $collections = collections.find();
                    return connection($collections);
                }
            }
        },
    };
});
