import {ApolloServer} from '@apollo/server';
import {startStandaloneServer} from '@apollo/server/standalone';
import {buildSubgraphSchema} from '@apollo/subgraph';


import { authSchema } from './schemas/auth.schemas.ts';
import { authResolvers } from './resolvers/auth.resolver.ts';


  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs: authSchema,
      resolvers: authResolvers,
    }),
    csrfPrevention: false,
    introspection: true,
  });

const {url} = await startStandaloneServer(server, {
  listen: {port: 4002},
});

console.log(`Auth service running at ${url}`);
