import { makePgService } from "@dataplan/pg/adaptors/pg";
import AmberPreset from "postgraphile/presets/amber";
import { makeV4Preset } from "postgraphile/presets/v4";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";
import { PgAggregatesPreset } from "@graphile/pg-aggregates";
import { PgManyToManyPreset } from "@graphile-contrib/pg-many-to-many";
import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
import {
  PgConnectionTotalCountPlugin,
  PgConnectionArgOrderByDefaultValuePlugin,
} from "postgraphile/graphile-build-pg";
import { PgAggregatesAddConnectionGroupedAggregatesPlugin } from "@graphile/pg-aggregates/dist/AddConnectionGroupedAggregatesPlugin";
import { PgAggregatesAddConnectionAggregatesPlugin } from "@graphile/pg-aggregates/dist/AddConnectionAggregatesPlugin";
import { NodePlugin } from "graphile-build";
import { TagsFilePlugin } from "postgraphile/utils";
import "postgraphile/grafserv/express/v4";
import { paginationArgsPlugins, polyRelationsPlugin } from "./plugins";


const preset: GraphileConfig.Preset = {
  extends: [
    AmberPreset,
    makeV4Preset({
      dynamicJson: true,
      ignoreIndexes: false,
      skipPlugins: [
        PgConnectionArgOrderByDefaultValuePlugin,
        PgConnectionTotalCountPlugin,
        PgAggregatesAddConnectionGroupedAggregatesPlugin,
        PgAggregatesAddConnectionAggregatesPlugin,
        NodePlugin,
      ],
    }),
    PostGraphileConnectionFilterPreset,
    PgManyToManyPreset,
    PgAggregatesPreset,
    PgSimplifyInflectionPreset,
  ],
  disablePlugins: ["QueryQueryPlugin"],
  gather: {
    pgStrictFunctions: true,
  },
  schema: {
    dontSwallowErrors: true,
    exportSchemaSDLPath: 'schema.graphql',
    defaultBehavior: "-delete -insert -update -query:*:*", // disables all queries generated based on tables adn all mutations.
  },
  pgServices: [
    makePgService({
      connectionString: 'postgres://postgres:postgres@localhost:5432/ax_media',
      schemas: ["public"],
      pubsub: true,
    }),
  ],
  plugins: [
    polyRelationsPlugin,
    // ...paginationArgsPlugins,
  ],
  grafserv: {
    port: 10305,
    graphiql: true,
    graphiqlPath: '/',
    websockets: true,
  },
  grafast: {
    explain: true,
    context(requestContext, args) {
      const response = requestContext.expressv4!.res;
      response.locals = {
        finalMaxAge: Infinity,
      };

      return {
        axSetHeader: (header: string, value: string) => {
          response?.setHeader(header, value);
        },
        responseLocals: response?.locals,
      } as any; // type errors
    },
  },
};

export default preset;
