import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gem2/main.dart';

void main() {
  testWidgets('MyApp smoke test', (WidgetTester tester) async {
    // Provide test values for required parameters
    await tester.pumpWidget(MyApp(
      onboardingCompleted: false,
      lastScreen: 'login',
    ));
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
