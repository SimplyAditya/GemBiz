// ignore_for_file: avoid_print

import 'package:flutter/material.dart';
import 'package:gem2/models/item_model.dart';
import 'package:gem2/services/graphql_service.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

class FirestoreService {
  // Save item using only itemId
  Future<void> saveItem(ItemModel item) async {
    final client = GraphQLService.initClient().value;

    const String createProductMutation = r'''
      mutation CreateProduct($input: ProductInput!) {
        createProduct(input: $input) {
          id
          name
          description
          price
        }
      }
    ''';

    final MutationOptions options = MutationOptions(
      document: gql(createProductMutation),
      variables: {
        'input': {
          'name': item.name,
          'description': item.description,
          'price': item.sellingPrice,
          // Add other fields as needed by your backend schema
        },
      },
    );

    final QueryResult result = await client.mutate(options);

    if (result.hasException) {
      print('Error saving item: ${result.exception.toString()}');
      throw Exception('Failed to save item: ${result.exception.toString()}');
    }

    print('Item saved successfully: ${item.itemId}');
  }

  // New method to update an item
  Future<void> updateItem(ItemModel item) async {
    final client = GraphQLService.initClient().value;

    const String updateProductMutation = r'''
      mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
        updateProduct(id: $id, input: $input) {
          id
          name
          description
          price
        }
      }
    ''';

    final MutationOptions options = MutationOptions(
      document: gql(updateProductMutation),
      variables: {
        'id': item.itemId,
        'input': {
          'name': item.name,
          'description': item.description,
          'price': item.sellingPrice,
        },
      },
    );

    final QueryResult result = await client.mutate(options);

    if (result.hasException) {
      print('Error updating item: ${result.exception.toString()}');
      throw Exception('Failed to update item: ${result.exception.toString()}');
    }

    print('Item updated successfully: ${item.itemId}');
  }

  // New method to delete an item
  Future<void> deleteItem(String itemId) async {
    final client = GraphQLService.initClient().value;

    const String deleteProductMutation = r'''
      mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id) {
          id
        }
      }
    ''';

    final MutationOptions options = MutationOptions(
      document: gql(deleteProductMutation),
      variables: {
        'id': itemId,
      },
    );

    final QueryResult result = await client.mutate(options);

    if (result.hasException) {
      print('Error deleting item: ${result.exception.toString()}');
      throw Exception('Failed to delete item: ${result.exception.toString()}');
    }

    print('Item deleted successfully: $itemId');
  }

  // Fetch item using only itemId
  Future<ItemModel?> getItem(String itemId) async {
    final client = GraphQLService.initClient().value;

    const String getProductQuery = r'''
      query GetProduct($id: ID!) {
        getProduct(id: $id) {
          id
          name
          description
          price
        }
      }
    ''';

    final QueryOptions options = QueryOptions(
      document: gql(getProductQuery),
      variables: {
        'id': itemId,
      },
    );

    final QueryResult result = await client.query(options);

    if (result.hasException) {
      print('Error retrieving item: ${result.exception.toString()}');
      throw Exception('Failed to retrieve item: ${result.exception.toString()}');
    }

    final data = result.data?['getProduct'];
    if (data != null) {
      print('Item retrieved successfully: $itemId');
      // Map GraphQL response to ItemModel
      // Note: You might need to adjust ItemModel to match GraphQL response structure
      // or map fields manually here.
      return ItemModel(
        id: data['id'],
        itemId: data['id'],
        uid: '', // Placeholder
        name: data['name'],
        description: data['description'],
        country: '', // Placeholder
        link: '', // Placeholder
        quantities: [], // Placeholder
        isReplacement: false, // Placeholder
        replacementDays: '', // Placeholder
        replacementUnit: '', // Placeholder
        colors: [], // Placeholder
        sizes: [], // Placeholder
        hideItem: false, // Placeholder
        itemStatus: '', // Placeholder
        imageUrls: [], // Placeholder
        mrp: 0.0, // Placeholder
        sellingPrice: (data['price'] as num).toDouble(),
        stockInfo: '', // Placeholder
      );
    } else {
      print('Item not found: $itemId');
      return null;
    }
  }

  Stream<List<ItemModel>> streamItems() async* {
    // GraphQL subscriptions or polling can be used here.
    // For simplicity, we'll use a polling approach or just a one-time fetch for now
    // as standard GraphQL queries are not streams.
    // If you need real-time updates, you'd use GraphQL Subscriptions.
    
    final client = GraphQLService.initClient().value;

    const String getProductsQuery = r'''
      query GetProducts {
        getProducts {
          id
          name
          description
          price
        }
      }
    ''';

    while (true) {
      try {
        final QueryResult result = await client.query(QueryOptions(
          document: gql(getProductsQuery),
          fetchPolicy: FetchPolicy.networkOnly,
        ));

        if (result.hasException) {
          print('Error streaming items: ${result.exception.toString()}');
          yield [];
        } else {
          final List<dynamic> products = result.data?['getProducts'] ?? [];
          yield products.map((data) => ItemModel(
            id: data['id'],
            itemId: data['id'],
            uid: '', // Placeholder
            name: data['name'],
            description: data['description'],
            country: '', // Placeholder
            link: '', // Placeholder
            quantities: [], // Placeholder
            isReplacement: false, // Placeholder
            replacementDays: '', // Placeholder
            replacementUnit: '', // Placeholder
            colors: [], // Placeholder
            sizes: [], // Placeholder
            hideItem: false, // Placeholder
            itemStatus: '', // Placeholder
            imageUrls: [], // Placeholder
            mrp: 0.0, // Placeholder
            sellingPrice: (data['price'] as num).toDouble(),
            stockInfo: '', // Placeholder
          )).toList();
        }
      } catch (e) {
        print('Error in streamItems: $e');
        yield [];
      }
      
      // Poll every 5 seconds (adjust as needed)
      await Future.delayed(const Duration(seconds: 5));
    }
  }
}
