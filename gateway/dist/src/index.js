import { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } from "@apollo/gateway";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "a-super-secret-key-that-is-at-least-32-characters-long";
async function startServer() {
    const gateway = new ApolloGateway({
        supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
                { name: "users", url: "http://localhost:4001/graphql" },
                { name: "auth", url: "http://localhost:4002/graphql" },
                { name: "products", url: "http://localhost:4003/graphql" },
                { name: "cart", url: "http://localhost:4004/graphql" },
                { name: "payments", url: "http://localhost:4005/graphql" }
            ],
        }),
        buildService: ({ name, url }) => {
            return new RemoteGraphQLDataSource({
                url: url,
                willSendRequest: ({ request, context }) => {
                    if (request.http && context.authorization) {
                        request.http.headers.set('authorization', context.authorization);
                    }
                },
            });
        },
    });
    const server = new ApolloServer({
        gateway,
        introspection: true,
    });
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
        context: async ({ req }) => {
            const authorization = req.headers.authorization || "";
            const token = authorization;
            let user = {};
            if (token) {
                try {
                    user = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
                }
                catch (e) {
                    console.error("Invalid token", e);
                }
            }
            return { user, authorization };
        },
    });
    console.log(`Server running at ${url}`);
}
startServer().catch((error) => {
    console.error("Error starting the server:", error);
});
//# sourceMappingURL=index.js.map