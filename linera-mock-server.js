/**
 * Linera Mock GraphQL Server
 * Gerçek Linera transaction'ları simüle eder
 */

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const cors = require('cors');

// GraphQL Schema
const schema = buildSchema(`
  type Query {
    chain(chainId: String!): Chain
    application(chainId: String!, applicationId: String!): Application
  }

  type Mutation {
    executeOperation(chainId: String!, operation: String!): OperationResult
  }

  type Chain {
    id: String!
    blockHeight: Int!
    timestamp: String!
    description: String
  }

  type Application {
    id: String!
    description: String
    state: String
  }

  type OperationResult {
    hash: String!
    blockHeight: Int!
    timestamp: String!
    success: Boolean!
  }
`);

// Mock data generator
const generateTxHash = () => {
  return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

const generateChainId = () => {
  return Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Resolvers
const root = {
  chain: ({ chainId }) => {
    return {
      id: chainId,
      blockHeight: Math.floor(Math.random() * 1000000) + 100000,
      timestamp: new Date().toISOString(),
      description: `Linera Chain ${chainId.slice(0, 8)}...`
    };
  },

  application: ({ chainId, applicationId }) => {
    return {
      id: applicationId,
      description: 'Casino Game Logger Application',
      state: JSON.stringify({
        gamesLogged: Math.floor(Math.random() * 1000),
        lastUpdate: new Date().toISOString()
      })
    };
  },

  executeOperation: ({ chainId, operation }) => {
    console.log('🎮 Linera Operation Executed:', {
      chainId: chainId.slice(0, 8) + '...',
      operation: JSON.parse(operation)
    });

    return {
      hash: generateTxHash(),
      blockHeight: Math.floor(Math.random() * 1000000) + 100000,
      timestamp: new Date().toISOString(),
      success: true
    };
  }
};

// Express app
const app = express();

// CORS
app.use(cors());

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Linera Mock Server',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log('🚀 Linera Mock GraphQL Server running on http://localhost:8080/graphql');
  console.log('📊 GraphiQL interface available at http://localhost:8080/graphql');
  console.log('❤️ Health check at http://localhost:8080/health');
});