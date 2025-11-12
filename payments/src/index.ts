import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { typeDefs } from "./schemas/payments.schemas.ts";
import { resolvers } from "./resolvers/payments.resolver.ts";
import jwt from "jsonwebtoken";
import "dotenv/config";


const JWT_SECRET = process.env.JWT_SECRET || "a-super-secret-key-that-is-at-least-32-characters-long";

async function startPaymentServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs: typeDefs,
      resolvers: resolvers,
    }),
    introspection: true,
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4005 },
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      if (token) {
        try {
          const user = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
          return { user };
        } catch (e) {
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
