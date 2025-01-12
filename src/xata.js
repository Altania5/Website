// Generated by Xata Codegen 0.30.1. Please do not edit.
import { buildClient } from "@xata.io/client";
import dotenv from 'dotenv';

dotenv.config();

/** @typedef { import('./types').SchemaTables } SchemaTables */
/** @type { SchemaTables } */
const tables = [
    {
        name: "Code",
        checkConstraints: {
            Code_xata_id_length_xata_id: {
                name: "Code_xata_id_length_xata_id",
                columns: ["xata_id"],
                definition: "CHECK ((length(xata_id) < 256))",
            },
        },
        foreignKeys: {},
        primaryKey: [],
        uniqueConstraints: {
            _pgroll_new_Code_xata_id_key: {
                name: "_pgroll_new_Code_xata_id_key",
                columns: ["xata_id"],
            },
        },
        columns: [
            {
                name: "xata_createdat",
                type: "datetime",
                notNull: true,
                unique: false,
                defaultValue: "now()",
                comment: "",
            },
            {
                name: "xata_id",
                type: "text",
                notNull: true,
                unique: true,
                defaultValue: "('rec_'::text || (xata_private.xid())::text)",
                comment: "",
            },
            {
                name: "xata_updatedat",
                type: "datetime",
                notNull: true,
                unique: false,
                defaultValue: "now()",
                comment: "",
            },
            {
                name: "xata_version",
                type: "int",
                notNull: true,
                unique: false,
                defaultValue: "0",
                comment: "",
            },
        ],
    },
];
/** @type { import('@xata.io/client').ClientConstructor<{}> } */
const DatabaseClient = buildClient();

const defaultOptions = {
    databaseURL: process.env.XATA_DATABASE_URL,
    apiKey: process.env.XATA_API_KEY,
    branch: process.env.XATA_BRANCH // Add branch option
};
/** @typedef { import('./types').DatabaseSchema } DatabaseSchema */
/** @extends DatabaseClient<DatabaseSchema> */
class XataClient extends DatabaseClient {
    constructor(options) {
        super({ ...defaultOptions, ...options }, tables);
    }
}

let instance = undefined;
/** @type { () => XataClient } */
export const getXataClient = () => {
    if (instance) return instance;
    instance = new XataClient();
    return instance;
};

export { XataClient };