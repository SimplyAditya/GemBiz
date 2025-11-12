import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { productSchema } from "./schemas/products.schemas.ts";
import { productResolvers } from "./resolvers/products.resolver.ts";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "a-super-secret-key-that-is-at-least-32-characters-long";

async function startProductServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs: productSchema,
      resolvers: productResolvers,
    }),
    introspection: true,
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4003 },
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      if (token) {
        try {
          const user = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
          console.log("Authenticated user:", user);
          return { user };
        } catch (e) {
          console.error("Invalid token", e);
        }
      }
      return {};
    },
  });
  console.log(`🚀 Products service ready at ${url}`);
}

startProductServer().catch((error) => {
  console.error("Error starting the products service:", error.message);
});
