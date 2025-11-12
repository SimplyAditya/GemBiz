import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { userSchema } from "./schemas/user.schemas.js";
import { userResolvers } from "./resolvers/user.resolver.js";
async function startUserServer() {
    const server = new ApolloServer({
        schema: buildSubgraphSchema({
            typeDefs: userSchema,
            resolvers: userResolvers,
        }),
        introspection: true,
    });
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4001 },
    });
    console.log(`User service running at ${url}`);
}
startUserServer().catch((error) => {
    console.error("Error starting the user service:", error.message);
});
//# sourceMappingURL=index.js.map