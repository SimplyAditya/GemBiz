import 'package:flutter/material.dart';
import 'package:gem2/services/graphql_service.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class BusinessCategoryScreen extends StatefulWidget {
  const BusinessCategoryScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _BusinessCategoryScreenState createState() => _BusinessCategoryScreenState();
}

class _BusinessCategoryScreenState extends State<BusinessCategoryScreen> {
  String? _currentUserUid;

  @override
  void initState() {
    super.initState();
    _loadCurrentUser();
  }

  Future<void> _loadCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _currentUserUid = prefs.getString('user_uid');
    });
  }

  // Function to add new category
  Future<void> _addNewCategory(String category) async {
    if (_currentUserUid != null) {
      final client = GraphQLService.initClient().value;

      const String createCategoryMutation = r'''
        mutation CreateCategory($name: String!) {
          createCategory(name: $name) {
            id
            name
            status
          }
        }
      ''';

      try {
        await client.mutate(MutationOptions(
          document: gql(createCategoryMutation),
          variables: {'name': category},
        ));
      } catch (e) {
        print('Error adding category: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    const String getCategoriesQuery = r'''
      query GetCategories {
        getCategories {
          id
          name
          status
          createdBy
        }
      }
    ''';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Select Business Category'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Query(
        options: QueryOptions(
          document: gql(getCategoriesQuery),
          fetchPolicy: FetchPolicy.networkOnly,
        ),
        builder: (QueryResult result, {VoidCallback? refetch, FetchMore? fetchMore}) {
          if (result.hasException) {
            return Center(child: Text('Error: ${result.exception.toString()}'));
          }
          if (result.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final List<dynamic> categories = result.data?['getCategories'] ?? [];

          final List<String> visibleCategories = categories
              .where((data) {
                final String status = data['status'] as String? ?? 'pending';
                final String createdBy = data['createdBy'] as String? ?? '';

                return (status == 'accepted') || (status == 'pending' && createdBy == _currentUserUid);
              })
              .map((data) => data['name'] as String? ?? 'Unnamed Category')
              .toList();
            
          visibleCategories.sort((a, b) => a.compareTo(b));

          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              GestureDetector(
                onTap: () => _showAddCategoryDialog(context, refetch),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 10.0),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.black),
                    borderRadius: BorderRadius.circular(30.0),
                  ),
                  child: const Center(
                    child: Text(
                      'Add New Category',
                      style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16.0),
               ...visibleCategories.asMap().entries.map((entry) {
                final isLast = entry.key == visibleCategories.length - 1;
                return Column(
                  children: [
                    ListTile(
                      title: Text(entry.value),
                      onTap: () {
                        Navigator.pop(context, entry.value);
                      },
                    ),
                    if (!isLast) const Divider(height: 1, thickness: 1),
                  ],
                );
              }),
            ],
          );
        },
      ),
    );
  }

  void _showAddCategoryDialog(BuildContext context, VoidCallback? refetch) {
    final TextEditingController categoryController = TextEditingController();
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Colors.white,
          title: const Text('Add New Category', style: TextStyle(color: Colors.black)),
          content: TextField(
            controller: categoryController,
            decoration: const InputDecoration(
              hintText: 'Enter category name',
              hintStyle: TextStyle(color: Colors.black54),
              border: OutlineInputBorder(),
              enabledBorder: OutlineInputBorder(
                borderSide: BorderSide(color: Colors.black54),
              ),
            ),
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Cancel', style: TextStyle(color: Colors.black)),
            ),
            TextButton(
              onPressed: () async {
                if (categoryController.text.isNotEmpty) {
                  await _addNewCategory(categoryController.text);
                  if (refetch != null) refetch();
                  // ignore: use_build_context_synchronously
                  Navigator.pop(context);
                }
              },
              child: const Text('Add', style: TextStyle(color: Colors.black)),
            ),
          ],
        );
      },
    );
  }
}
