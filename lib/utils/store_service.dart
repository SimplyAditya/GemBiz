// ignore_for_file: avoid_print

import 'package:flutter/material.dart';
import 'package:gem2/providers/auth_provider.dart';
import 'package:gem2/services/graphql_service.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:provider/provider.dart';

class StoreService {
  // We need a way to get the current user ID. 
  // Since this is a service class, we might need to pass the context or the ID directly.
  // Or we can access the AuthProvider if we have a context, or use a singleton/global access if set up.
  // For now, let's assume we can get it from SharedPreferences via AuthProvider or passed in.
  
  // However, AuthProvider has the ID. Let's try to get it from there if possible, 
  // but usually services shouldn't depend on UI providers directly without context.
  // Let's assume the caller handles providing the ID or we use the token from GraphQLService.

  Future<bool> doesStoreExist(String uid) async {
    // TODO: Implement GraphQL query to check store existence
    // For now, returning false to simulate no store or true if we want to skip registration
    return false;
  }

  Future<Map<String, dynamic>?> fetchStoreForCurrentUser(String uid) async {
    final client = GraphQLService.initClient().value;

    const String getStoreQuery = r'''
      query GetStore($userId: ID!) {
        getStore(userId: $userId) {
          id
          name
          description
          # Add other fields
        }
      }
    ''';

    final QueryOptions options = QueryOptions(
      document: gql(getStoreQuery),
      variables: {
        'userId': uid,
      },
    );

    final QueryResult result = await client.query(options);

    if (result.hasException) {
      print('Error fetching store: ${result.exception.toString()}');
      return null;
    }

    final data = result.data?['getStore'];
    if (data != null) {
      return data as Map<String, dynamic>;
    } else {
      return null;
    }
  }

  Future<bool> createStore(String uid, Map<String, dynamic> storeData) async {
    final client = GraphQLService.initClient().value;

    const String createStoreMutation = r'''
      mutation CreateStore($input: StoreInput!) {
        createStore(input: $input) {
          id
          name
        }
      }
    ''';

    final MutationOptions options = MutationOptions(
      document: gql(createStoreMutation),
      variables: {
        'input': {
          'name': storeData['businessName'],
          'description': storeData['businessDescription'],
          // Map other fields from storeData to StoreInput
        },
      },
    );

    final QueryResult result = await client.mutate(options);

    if (result.hasException) {
      print('Error creating store: ${result.exception.toString()}');
      return false;
    }

    return true;
  }
}
