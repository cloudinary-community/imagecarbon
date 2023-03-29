// Generated by Xata Codegen 0.23.2. Please do not edit.
import { buildClient } from "@xata.io/client";
import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";

const tables = [
  {
    name: "Sites",
    columns: [
      { name: "siteUrl", type: "string", unique: true },
      { name: "dateCollected", type: "datetime" },
    ],
  },
  {
    name: "Images",
    columns: [
      { name: "optimized", type: "text" },
      { name: "original", type: "text" },
      { name: "siteUrl", type: "text" },
      { name: "uploaded", type: "text" },
      { name: "width", type: "int" },
      { name: "height", type: "int" },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type Sites = InferredTypes["Sites"];
export type SitesRecord = Sites & XataRecord;

export type Images = InferredTypes["Images"];
export type ImagesRecord = Images & XataRecord;

export type DatabaseSchema = {
  Sites: SitesRecord;
  Images: ImagesRecord;
};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL: "https://ImageCarbon-hm2i7i.us-east-1.xata.sh/db/sites",
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient();
  return instance;
};
