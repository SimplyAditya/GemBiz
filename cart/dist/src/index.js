import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { cartSchema } from "./schemas/cart.schemas.js";
import { cartResolvers } from "./resolvers/cart.resolver.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "a-super-secret-key-that-is-at-least-32-characters-long";
async function startCartServer() {
    const server = new ApolloServer({
        schema: buildSubgraphSchema({
            typeDefs: cartSchema,
            resolvers: cartResolvers,
        }),
        introspection: true,
    });
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4004 },
        context: async ({ req }) => {
            const token = req.headers.authorization || "";
            if (token) {
                try {
                    const user = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
                    return { user };
                }
                catch (e) {
                    console.error("Invalid token", e);
                }
            }
            return {};
        },
    });
    console.log(`🚀 Cart service ready at ${url}`);
}
startCartServer().catch((error) => {
    console.error("Error starting the cart service:", error.message);
});
//# sourceMappingURL=index.js.map