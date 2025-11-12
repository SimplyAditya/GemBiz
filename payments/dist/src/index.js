"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const subgraph_1 = require("@apollo/subgraph");
const payments_schemas_js_1 = require("./schemas/payments.schemas.js");
const payments_resolver_js_1 = require("./resolvers/payments.resolver.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const JWT_SECRET = process.env.JWT_SECRET || "a-super-secret-key-that-is-at-least-32-characters-long";
async function startPaymentServer() {
    const server = new server_1.ApolloServer({
        schema: (0, subgraph_1.buildSubgraphSchema)({
            typeDefs: payments_schemas_js_1.typeDefs,
            resolvers: payments_resolver_js_1.resolvers,
        }),
        introspection: true,
    });
    const { url } = await (0, standalone_1.startStandaloneServer)(server, {
        listen: { port: 4005 },
        context: async ({ req }) => {
            const token = req.headers.authorization || "";
            if (token) {
                try {
                    const user = jsonwebtoken_1.default.verify(token.replace("Bearer ", ""), JWT_SECRET);
                    return { user };
                }
                catch (e) {
                    console.error("Invalid token", e);
                }
            }
            return {};
        },
    });
    console.log(`🚀 Payments service ready at ${url}`);
}
startPaymentServer().catch((error) => {
    console.error("Error starting the payments service:", error.message);
});
//# sourceMappingURL=index.js.map