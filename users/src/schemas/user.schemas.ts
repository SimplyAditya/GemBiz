import { gql } from 'graphql-tag';

export const userSchema = gql`
    type User @key(fields: "id") {
        id: ID!
        email: String!
        name: String
        phone: String
    }

    type Business {
        id: ID!
        storeverified: Boolean!
        category: String!
        name: String!
        description: String!
        storeTimes: String!  # JSON string for Map<String, List<Map<String, dynamic>>>
        store_timings: String!
        email: String!
        website: String
        gst_id: String
        gst: GST
        logo_image_url: String
        mobile: String!
        address: String!
        user_type: String!
        user_name: String!
        uid: String!
        created_at: String
        updated_at: String
    }

    type GST {
        id: ID!
        gst_file_url: String
        gst_file_type: String
        gst_no: String
    }

    input userInput {
        email: String!
        password: String!
        name: String!
        phone: String
    }

    input gstInput {
        gst_file_url: String
        gst_file_type: String
        gst_no: String
    }

    input businessInput {
        storeverified: Boolean!
        category: String!
        name: String!
        description: String!
        storeTimes: String!  # JSON string
        store_timings: String!
        email: String!
        website: String
        gst: gstInput!
        logo_image_url: String
        mobile: String!
        address: String!
        user_type: String!
        user_name: String!
        uid: String!
    }

    type Mutation {
        createUser(input: userInput!): User!
        upgradeToSeller(input: String!): User!
        addBusiness(input: businessInput!): Business!
    }
    type Query {
        getUser(id: ID!): User
        getBusiness(uid: String!): Business
    }
`
