// ignore_for_file: avoid_print, deprecated_member_use

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:gem2/widgets/snackbar.dart';
import 'package:provider/provider.dart';
import 'package:gem2/providers/auth_provider.dart';
import 'package:gem2/screens/registration.dart';
import 'package:gem2/screens/catalouge_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  String? tncUrl = "https://gembiz.adityabansal.in/terms"; // Default URL
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // _initializeStream(); // Removed Firestore stream
  }

  Future<void> _launchUrl(String? url) async {
    if (url != null && await canLaunch(url)) {
      await launch(url);
    } else {
      print("Could not launch $url");
    }
  }

  Future _updateLastScreen(String screenName) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('lastScreen', screenName);
      print("[LoginScreen] Updated lastScreen to: $screenName");
    } catch (e) {
      print("[LoginScreen] Error updating lastScreen: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AppAuthProvider>(
      builder: (context, authProvider, child) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (authProvider.status == AuthStatus.hasStore) {
            _updateLastScreen('catalogue');
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (_) => const CatalogueScreen()),
              (route) => false,
            );
          } else if (authProvider.status == AuthStatus.noStore) {
            _updateLastScreen('registration');
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (_) => const RegistrationScreen()),
              (route) => false,
            );
          }
        });

        return Scaffold(
          backgroundColor: Colors.white,
          body: SafeArea(
            child: Stack(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32.0),
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      return SingleChildScrollView(
                        child: ConstrainedBox(
                          constraints: BoxConstraints(
                            minHeight: constraints.maxHeight,
                          ),
                          child: IntrinsicHeight(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Expanded(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      Image.asset(
                                        'assets/images/logo.png',
                                        width: 150.0,
                                        height: 150.0,
                                      ),
                                      const Text(
                                        'GemBiz',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontSize: 24.0,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const Text(
                                        'Business',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontSize: 24.0,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const Text(
                                  'Login',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontSize: 14.0),
                                ),
                                const SizedBox(height: 16.0),
                                TextField(
                                  controller: _emailController,
                                  decoration: const InputDecoration(
                                    labelText: 'Email',
                                    border: OutlineInputBorder(),
                                  ),
                                ),
                                const SizedBox(height: 16.0),
                                TextField(
                                  controller: _passwordController,
                                  decoration: const InputDecoration(
                                    labelText: 'Password',
                                    border: OutlineInputBorder(),
                                  ),
                                  obscureText: true,
                                ),
                                const SizedBox(height: 16.0),
                                _buildLoginButton(
                                    context,
                                    authProvider.status ==
                                        AuthStatus.authenticating),
                                const SizedBox(height: 16.0),
                                _buildPolicyText(),
                                const SizedBox(height: 30.0),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildLoginButton(BuildContext context, bool isLoading) {
    return ElevatedButton(
      onPressed: isLoading
          ? null
          : () async {
              try {
                await context.read<AppAuthProvider>().login(
                  _emailController.text,
                  _passwordController.text,
                );
              } catch (e) {
                if (context.mounted) {
                  showTopSnackBar(context, 'Failed to sign in: $e');
                }
              }
            },
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 10),
        minimumSize: const Size(double.infinity, 50.0),
        disabledBackgroundColor: Colors.black,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (isLoading)
            const SizedBox(
              height: 25.0,
              width: 25.0,
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                strokeWidth: 2.5,
              ),
            ),
          if (isLoading) const SizedBox(width: 10),
          Text(
            isLoading ? 'Please wait...' : 'Login',
            style: const TextStyle(color: Colors.white),
          ),
        ],
      ),
    );
  }

  Widget _buildPolicyText() {
    return RichText(
      textAlign: TextAlign.center,
      text: TextSpan(
        style: const TextStyle(
          fontSize: 12.0,
          color: Colors.black,
        ),
        children: [
          const TextSpan(text: 'I agree to GemBiz '),
          TextSpan(
            text: 'Terms & Conditions',
            style: const TextStyle(color: Colors.blue),
            recognizer: TapGestureRecognizer()
              ..onTap = () {
                _launchUrl(tncUrl);
              },
          ),
          const TextSpan(text: ', '),
          TextSpan(
            text: 'Store Creation',
            style: const TextStyle(color: Colors.blue),
            recognizer: TapGestureRecognizer()
              ..onTap = () {
                _launchUrl(tncUrl);
              },
          ),
          const TextSpan(text: ' and '),
          TextSpan(
            text: 'Advertising Policies',
            style: const TextStyle(color: Colors.blue),
            recognizer: TapGestureRecognizer()
              ..onTap = () {
                _launchUrl(tncUrl);
              },
          ),
          const TextSpan(text: '.'),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
