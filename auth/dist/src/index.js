import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { authSchema } from './schemas/auth.schemas.js';
import { authResolvers } from './resolvers/auth.resolver.js';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "a-super-secret-key-that-is-at-least-32-characters-long";
const server = new ApolloServer({
    schema: buildSubgraphSchema({
        typeDefs: authSchema,
        resolvers: authResolvers,
    }),
    csrfPrevention: false,
    introspection: true,
});
const { url } = await startStandaloneServer(server, {
    listen: { port: 4002 },
    context: async ({ req }) => {
        const token = req.headers.authorization || "";
        if (token) {
            try {
                const user = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
                console.log("Authenticated user:", user);
                return { user };
            }
            catch (e) {
                console.error("Invalid token", e);
            }
        }
        return {};
    },
});
console.log(`Auth service running at ${url}`);
//# sourceMappingURL=index.js.map