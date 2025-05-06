// ignore_for_file: avoid_print

import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gem2/providers/auth_provider.dart' as app_auth;
import 'package:gem2/providers/location_provider.dart';
import 'package:gem2/providers/store_data_provider.dart';
import 'package:gem2/providers/store_verification_provider.dart';
import 'package:gem2/screens/catalouge_screen.dart';
import 'package:gem2/screens/login_screen.dart';
import 'package:gem2/screens/onboarding_screen.dart';
import 'package:gem2/screens/registration.dart';
import 'package:gem2/screens/splash_screen.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  final prefs = await SharedPreferences.getInstance();

  print("Initial SharedPreferences values:");
  print("onboarding: ${prefs.getBool('onboarding')}");
  print("lastScreen: ${prefs.getString('lastScreen')}");

  final onboardingCompleted = prefs.getBool("onboarding") ?? false;
  final lastScreen = prefs.getString('lastScreen') ?? 'login';

  await FirebaseAppCheck.instance.activate(
    androidProvider: AndroidProvider.debug,
    appleProvider: AppleProvider.appAttest,
  );

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => app_auth.AppAuthProvider()),
        ChangeNotifierProvider(create: (_) => StoreDataProvider()),
        ChangeNotifierProvider(create: (_) => StoreVerificationProvider()),
        ChangeNotifierProvider(create: (_) => LocationProvider()),
      ],
      child: MyApp(
        onboardingCompleted: onboardingCompleted,
        lastScreen: lastScreen,
      ),
    ),
  );
}

class MyApp extends StatelessWidget {
  final bool onboardingCompleted;
  final String lastScreen;

  const MyApp({
    super.key,
    required this.onboardingCompleted,
    required this.lastScreen,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        textTheme: GoogleFonts.poppinsTextTheme(
          Theme.of(context).textTheme,
        ),
      ),
      home: Consumer<app_auth.AppAuthProvider>(
        builder: (context, authProvider, _) {
          final status = authProvider.status;

          if (status == app_auth.AuthStatus.initial) {
            return const SplashScreen();
          }

          if (!onboardingCompleted) {
            return const OnboardingScreen();
          }

          final isLoggedIn = status == app_auth.AuthStatus.authenticated ||
              status == app_auth.AuthStatus.hasStore ||
              status == app_auth.AuthStatus.noStore;

          if (!isLoggedIn) {
            return const LoginScreen();
          }

          if (lastScreen == 'catalogue') {
            return const CatalogueScreen();
          } else if (lastScreen == 'registration') {
            return const RegistrationScreen();
          }

          switch (status) {
            case app_auth.AuthStatus.unauthenticated:
              return const LoginScreen();
            case app_auth.AuthStatus.hasStore:
              return const CatalogueScreen();
            case app_auth.AuthStatus.noStore:
              return const RegistrationScreen();
            default:
              return const LoginScreen();
          }
        },
      ),
    );
  }
}
