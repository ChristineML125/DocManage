import 'package:flutter/material.dart';
import '../api/user_api.dart';
import '../pages/dashboard.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();

  bool loading = false;
  String? errorMsg;

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    final username = _usernameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final confirm = _confirmController.text;

    if (username.isEmpty || email.isEmpty || password.isEmpty) {
      setState(() => errorMsg = 'Please fill in all fields.');
      return;
    }
    if (password != confirm) {
      setState(() => errorMsg = 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setState(() => errorMsg = 'Password must be at least 6 characters.');
      return;
    }

    setState(() {
      loading = true;
      errorMsg = null;
    });

    try {
      final response = await UserApi.registerPersonal(
        username: username,
        email: email,
        password: password,
      );

      if (!mounted) return;

      if (response['token'] != null) {
        final user = response['user'] ?? {};
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => Dashboard(
              username: user['UserName'] ?? username,
              role: user['role'] ?? 'staff',
              userId: user['UserID'] is int
                  ? user['UserID']
                  : int.parse('${user['UserID'] ?? 0}'),
              userType: user['userType'] ?? 'personal',
              mustChangePassword: response['mustChangePassword'] == true,
            ),
          ),
        );
      } else {
        setState(() {
          errorMsg = response['message'] ?? 'Registration failed.';
        });
      }
    } catch (e) {
      setState(() {
        errorMsg = e.toString().contains('already')
            ? 'Username or email already exists.'
            : 'Registration failed. Please try again.';
      });
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const teal = Color(0xFF005e53);

    return Scaffold(
      backgroundColor: const Color(0xfff7f9fb),
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Container(
              width: 400,
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    blurRadius: 15,
                    color: Colors.black.withOpacity(0.1),
                    offset: const Offset(0, 10),
                  )
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.asset(
                        'assets/logo.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                  const Text(
                    "Docly",
                    style: TextStyle(
                      fontSize: 25,
                      fontWeight: FontWeight.bold,
                      color: teal,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      "Create Account",
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      "Sign up to start managing your documents.",
                      style: TextStyle(fontSize: 13, color: Color(0xFF6e7a76)),
                    ),
                  ),
                  const SizedBox(height: 20),

                  TextField(
                    controller: _usernameController,
                    decoration: InputDecoration(
                      labelText: "Username",
                      hintText: "Choose a username",
                      prefixIcon: const Icon(Icons.person_outline),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      labelText: "Email",
                      hintText: "your@email.com",
                      prefixIcon: const Icon(Icons.email_outlined),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  TextField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: "Password",
                      hintText: "At least 6 characters",
                      prefixIcon: const Icon(Icons.lock_outline),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  TextField(
                    controller: _confirmController,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: "Confirm Password",
                      hintText: "Re-enter your password",
                      prefixIcon: const Icon(Icons.lock_outline),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: loading ? null : _register,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: teal,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: loading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text("Create Account", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    ),
                  ),

                  if (errorMsg != null) ...[
                    const SizedBox(height: 12),
                    Text(errorMsg!, style: const TextStyle(color: Colors.red, fontSize: 13)),
                  ],

                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Already have an account? ",
                          style: TextStyle(fontSize: 13, color: Color(0xFF6e7a76))),
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: const Text("Sign In",
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: teal)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
