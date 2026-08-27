import 'package:flutter/material.dart';

import 'api/http_service.dart';
import 'pages/login_page.dart';
import 'pages/dashboard.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await HttpService.init();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final hasToken = HttpService.token != null;
    final user = HttpService.savedUser;

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Dovra',

      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),

      initialRoute: hasToken ? '/dashboard' : '/login',
      routes: {
        '/login': (context) => const LoginPage(),
        '/dashboard': (context) => Dashboard(
          username: user?['UserName'] ?? '',
          role: user?['role'] ?? 'staff',
          userId: user?['UserID'] is int
              ? user!['UserID']
              : int.parse('${user?['UserID'] ?? 0}'),
          userType: user?['userType'] ?? 'company',
          mustChangePassword: user?['mustChangePassword'] == true,
        ),
      },
    );
  }
}
