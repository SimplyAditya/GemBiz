import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';


async function startServer() {
  
  const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
       { name: "users", url: "http://localhost:4001/graphql" }
    ],
  }),
})


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
  console.error('Error starting the server:', error);
});