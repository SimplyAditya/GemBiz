// ignore_for_file: avoid_print

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gem2/models/item_model.dart';
import 'package:gem2/services/graphql_service.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StoreVerificationProvider with ChangeNotifier {
  bool? _isVerified;
  ItemModel? _savedItem;
  ItemModel? _presentItem;

  bool get isVerified => _isVerified ?? false;
  ItemModel? get savedItem => _savedItem;
  ItemModel? get presentItem => _presentItem;

  void setCurrentItem(ItemModel item) {
    _presentItem = item;
    notifyListeners();
  }

  void saveItem(ItemModel item) {
    _savedItem = item;
    notifyListeners();
  }

  void initializeVerificationStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final currentUserUid = prefs.getString('user_uid');
    
    if (currentUserUid == null) {
      return;
    }

    // In GraphQL, we would typically use a subscription or poll.
    // For now, let's just fetch once.
    await _checkVerificationStatus(currentUserUid);
  }

  Future<void> _checkVerificationStatus(String uid) async {
    final client = GraphQLService.initClient().value;

    const String getStoreVerificationQuery = r'''
      query GetStoreVerification($userId: ID!) {
        getStore(userId: $userId) {
          id
          storeverified # Assuming this field exists in your schema
        }
      }
    ''';

    try {
      final QueryResult result = await client.query(QueryOptions(
        document: gql(getStoreVerificationQuery),
        variables: {'userId': uid},
        fetchPolicy: FetchPolicy.networkOnly,
      ));

      if (result.hasException) {
        print('Error fetching verification status: ${result.exception.toString()}');
        return;
      }

      final data = result.data?['getStore'];
      if (data != null) {
        final newValue = data['storeverified'] ?? false;
        if (_isVerified != newValue) {
          _isVerified = newValue;
          notifyListeners();
        }
      } else {
        _isVerified = false;
        notifyListeners();
      }
    } catch (e) {
      print('Error checking verification status: $e');
    }
  }

  Future<void> toggleVerification() async {
    final prefs = await SharedPreferences.getInstance();
    final currentUserUid = prefs.getString('user_uid');
    
    if (currentUserUid == null) {
      return;
    }

    // Only allow changing from false to true
    if (_isVerified == true) return;

    final client = GraphQLService.initClient().value;

    // TODO: Implement mutation to verify store
    const String verifyStoreMutation = r'''
      mutation VerifyStore($userId: ID!) {
        verifyStore(userId: $userId) {
          id
          storeverified
        }
      }
    ''';

    try {
      final QueryResult result = await client.mutate(MutationOptions(
        document: gql(verifyStoreMutation),
        variables: {'userId': currentUserUid},
      ));

      if (result.hasException) {
        print('Error updating verification status: ${result.exception.toString()}');
        return;
      }

      final data = result.data?['verifyStore'];
      if (data != null) {
        _isVerified = data['storeverified'];
        notifyListeners();
      }
    } catch (e) {
      print('Error updating verification status: $e');
    }
  }
}
