import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schemas/payments.schemas.js";
import { resolvers } from "./resolvers/payments.resolver.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

interface MyContext {
  userId?: string;
}

const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 4005;
const JWT_SECRET = process.env.JWT_SECRET || "a-super-secret-key-that-is-at-least-32-characters-long";

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port },
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
};

startServer();
