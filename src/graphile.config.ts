// @ts-check
import { makePgService } from "@dataplan/pg/adaptors/pg";
import AmberPreset from "postgraphile/presets/amber";
import { makeV4Preset } from "postgraphile/presets/v4";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";
import { PgAggregatesPreset } from "@graphile/pg-aggregates";
import { PgManyToManyPreset } from "@graphile-contrib/pg-many-to-many";
import { paginationWrapPlugin, polyRelationsPlugin } from "./plugins";
// import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";

// For configuration file details, see: https://postgraphile.org/postgraphile/next/config

/** @satisfies {GraphileConfig.Preset} */
const preset = {
  extends: [
    AmberPreset,
    makeV4Preset({
      /* Enter your V4 options here */
      graphiql: true,
      graphiqlRoute: "/",
    }),
    PostGraphileConnectionFilterPreset,
    PgManyToManyPreset,
    PgAggregatesPreset,
    // PgSimplifyInflectionPreset
  ],
  plugins: [
    polyRelationsPlugin,
    paginationWrapPlugin
  ],
  pgServices: [
    makePgService({
      connectionString: 'postgres://postgres:postgres@localhost:5432/ax_media',
      schemas: ["public"],
      pubsub: true,
    }),
  ],
  grafserv: {
    port: 10305,
    websockets: true,
  },
  grafast: {
    explain: true,
  },
};

export default preset;
