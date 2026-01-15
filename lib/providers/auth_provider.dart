// ignore_for_file: constant_identifier_names, avoid_print

import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:gem2/services/graphql_service.dart';

enum AuthStatus {
  initial,
  authenticating,
  authenticated,
  unauthenticated,
  hasStore,
  noStore,
}

class AppAuthProvider with ChangeNotifier {
  static const String IS_LOGGED_IN_KEY = 'is_logged_in';
  static const String HAS_STORE_KEY = 'has_store';
  static const String USER_UID_KEY = 'user_uid';
  static const String AUTH_TOKEN_KEY = 'auth_token';

  AuthStatus _status = AuthStatus.initial;
  AuthStatus get status => _status;

  String? _currentUserUid;
  String? get currentUserUid => _currentUserUid;

  AppAuthProvider() {
    _initializeAuthState();
  }

  Future<void> setOnboardingCompleted() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool("onboarding", true);
  }

  Future<void> setLastScreen(String screenName) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('lastScreen', screenName);
  }

  Future<void> _saveUserState({
    required bool isLoggedIn,
    required bool? hasStore,
    String? uid,
    String? token,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(IS_LOGGED_IN_KEY, isLoggedIn);
    if (hasStore != null) {
      await prefs.setBool(HAS_STORE_KEY, hasStore);
    }
    if (uid != null) {
      await prefs.setString(USER_UID_KEY, uid);
    }
    if (token != null) {
      await prefs.setString(AUTH_TOKEN_KEY, token);
    }
    print("[AuthProvider] Saved user state - LoggedIn: $isLoggedIn, HasStore: $hasStore, UID: $uid");
  }

  Future _initializeAuthState() async {
    print("[AuthProvider] Starting auth state initialization");
    
    final prefs = await SharedPreferences.getInstance();
    final isLoggedIn = prefs.getBool(IS_LOGGED_IN_KEY) ?? false;
    final hasStore = prefs.getBool(HAS_STORE_KEY) ?? false;
    final savedUid = prefs.getString(USER_UID_KEY);
    final token = prefs.getString(AUTH_TOKEN_KEY);

    if (isLoggedIn && savedUid != null && token != null) {
      _currentUserUid = savedUid;
      _status = hasStore ? AuthStatus.hasStore : AuthStatus.noStore;
    } else {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    try {
      _status = AuthStatus.authenticating;
      notifyListeners();

      final client = GraphQLService.initClient().value;

      const String loginMutation = r'''
        mutation ValidateUser($input: authInput!) {
          validateUser(input: $input) {
            id
            token
            role
          }
        }
      ''';

      final MutationOptions options = MutationOptions(
        document: gql(loginMutation),
        variables: {
          'input': {
            'email': email,
            'password': password,
          },
        },
      );

      final QueryResult result = await client.mutate(options);

      if (result.hasException) {
        print("Login Exception: ${result.exception.toString()}");
        _status = AuthStatus.unauthenticated;
        notifyListeners();
        throw Exception(result.exception.toString());
      }

      final data = result.data?['validateUser'];
      if (data != null) {
        final String token = data['token'];
        final String uid = data['id'];
        final String? role = data['role'];
        
        // Check if user has a store (seller role implies store existence in this context, 
        // or we might need a separate query if role isn't enough)
        // For now, let's assume we need to check store existence separately or derive it
        // If role is 'seller', they might have a store.
        
        // Let's check store existence via another query if needed, or assume based on role
        // For this migration, let's query store existence
        
        final bool hasStore = await _checkStoreExistence(uid);

        _currentUserUid = uid;
        _status = hasStore ? AuthStatus.hasStore : AuthStatus.noStore;
        
        await _saveUserState(
          isLoggedIn: true,
          hasStore: hasStore,
          uid: uid,
          token: token,
        );
        
        notifyListeners();
      } else {
        throw Exception("Login failed: No data returned");
      }
    } catch (e) {
      print("Login Error: $e");
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      rethrow;
    }
  }

  Future<bool> _checkStoreExistence(String uid) async {
    // TODO: Implement GraphQL query to check if store exists
    // For now returning false to force registration flow or true if we assume
    // We need a backend resolver for this.
    // Assuming we can query user and check if they have products or a specific store field
    // Or we can add a 'hasStore' field to the User type in backend
    
    // Temporary: return false so we can test registration flow, or true if we want to skip
    return false; 
  }

  Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('lastScreen');
      await prefs.remove(IS_LOGGED_IN_KEY);
      await prefs.remove(HAS_STORE_KEY);
      await prefs.remove(USER_UID_KEY);
      await prefs.remove(AUTH_TOKEN_KEY);

      _currentUserUid = null;
      _status = AuthStatus.unauthenticated;
      notifyListeners();
    } catch (e) {
      print("Logout Error: $e");
      rethrow;
    }
  }

  Future<Map<String, dynamic>> addBusiness(Map<String, dynamic> businessData) async {
    try {
      final client = GraphQLService.initClient().value;

      const String addBusinessMutation = r'''
        mutation AddBusiness($input: businessInput!) {
          addBusiness(input: $input) {
            id
            name
            gst_id
          }
        }
      ''';

      final MutationOptions options = MutationOptions(
        document: gql(addBusinessMutation),
        variables: {
          'input': businessData,
        },
      );

      final QueryResult result = await client.mutate(options);

      if (result.hasException) {
        print("Add Business Exception: ${result.exception.toString()}");
        return {
          'success': false,
          'error': result.exception.toString(),
        };
      }

      final data = result.data?['addBusiness'];
      if (data != null) {
        // Update auth status to indicate user now has a store
        _status = AuthStatus.hasStore;
        await _saveUserState(
          isLoggedIn: true,
          hasStore: true,
          uid: _currentUserUid,
        );
        notifyListeners();

        return {
          'success': true,
          'data': data,
        };
      } else {
        return {
          'success': false,
          'error': 'Failed to create business account',
        };
      }
    } catch (e) {
      print("Add Business Error: $e");
      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }
}
