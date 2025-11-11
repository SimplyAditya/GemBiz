import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

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
  });

  const server = new ApolloServer({
    gateway,
    introspection: true,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`Server running at ${url}`);
}

startServer().catch((error) => {
  console.error("Error starting the server:", error);
});
