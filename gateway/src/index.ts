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
        { name: "users", url: "https://api-gembiz.adityabansal.in/users/graphql" },
        { name: "auth", url: "https://api-gembiz.adityabansal.in/auth/graphql" },
        { name: "products", url: "https://api-gembiz.adityabansal.in/products/graphql" },
        { name: "cart", url: "https://api-gembiz.adityabansal.in/cart/graphql" },
        { name: "payments", url: "https://api-gembiz.adityabansal.in/payments/graphql" }
      ],
    }),
    buildService: ({ name, url }) => {
      return new RemoteGraphQLDataSource({
        url: url!,
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
        } catch (e) {
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
