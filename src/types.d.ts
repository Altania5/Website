import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";
declare const tables: readonly [
  {
    readonly name: "Code";
    readonly checkConstraints: {
      readonly Code_xata_id_length_xata_id: {
        readonly name: "Code_xata_id_length_xata_id";
        readonly columns: readonly ["xata_id"];
        readonly definition: "CHECK ((length(xata_id) < 256))";
      };
    };
    readonly foreignKeys: {};
    readonly primaryKey: readonly [];
    readonly uniqueConstraints: {
      readonly _pgroll_new_Code_xata_id_key: {
        readonly name: "_pgroll_new_Code_xata_id_key";
        readonly columns: readonly ["xata_id"];
      };
    };
    readonly columns: readonly [
      {
        readonly name: "xata_createdat";
        readonly type: "datetime";
        readonly notNull: true;
        readonly unique: false;
        readonly defaultValue: "now()";
        readonly comment: "";
      },
      {
        readonly name: "xata_id";
        readonly type: "text";
        readonly notNull: true;
        readonly unique: true;
        readonly defaultValue: "('rec_'::text || (xata_private.xid())::text)";
        readonly comment: "";
      },
      {
        readonly name: "xata_updatedat";
        readonly type: "datetime";
        readonly notNull: true;
        readonly unique: false;
        readonly defaultValue: "now()";
        readonly comment: "";
      },
      {
        readonly name: "xata_version";
        readonly type: "int";
        readonly notNull: true;
        readonly unique: false;
        readonly defaultValue: "0";
        readonly comment: "";
      }
    ];
  }
];
export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;
export type Code = InferredTypes["Code"];
export type CodeRecord = Code & XataRecord;
export type DatabaseSchema = {
  Code: CodeRecord;
};
declare const DatabaseClient: any;
export declare class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions);
}
export declare const getXataClient: () => XataClient;
export {};
