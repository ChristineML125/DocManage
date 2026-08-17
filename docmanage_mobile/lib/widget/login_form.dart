import 'package:flutter/material.dart';
import '../api/user_api.dart';
import '../pages/dashboard.dart';

class LoginForm extends StatefulWidget {
  const LoginForm({super.key});

  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool loading = false;
  String? errorMsg;
  String? resetMsg;

  Future<void> _handleForgotPassword() async {
    final username = _usernameController.text.trim();
    if (username.isEmpty) {
      setState(() {
        errorMsg = 'Enter your username first, then select Forgot password.';
        resetMsg = null;
      });
      return;
    }

    setState(() {
      loading = true;
      errorMsg = null;
      resetMsg = null;
    });

    try {
      final result = await UserApi.requestPasswordReset(username);
      setState(() {
        resetMsg = result['message'] ?? 'Password reset request submitted.';
      });
    } catch (e) {
      setState(() {
        errorMsg = 'Unable to send password-reset request.';
      });
    } finally {
      setState(() {
        loading = false;
      });
    }
  }

  Future<void> _login() async {

    setState(() {
      loading = true;
      errorMsg = null;
      resetMsg = null;
    });

      try{

      final response = await UserApi.loginUser(_usernameController.text, _passwordController.text);
      if (response["success"] == true) {
        debugPrint ("Login successful");

        final user = response["user"];
        final role = user["role"];


        if(!mounted) return;

        Navigator.pushReplacement(
          context,

          MaterialPageRoute(

            builder:(context)=>Dashboard(
              username: user["UserName"],
              role: role,
              userId: user["UserID"] is int
                  ? user["UserID"]
                  : int.parse(user["UserID"].toString()),
              mustChangePassword: response["mustChangePassword"] == true,

            ),

          ),

        );


      } else {
        setState(() {
          errorMsg = response['message'] ?? 'Login failed';
        });
      }
    } catch (e) {
      debugPrint("Login failed: $e");
      setState(() {
        errorMsg = 'Unable to connect to server. Please try again.';
      });
    } finally {
      setState(() {
        loading = false;
      });
    }
  }

  // build method to create the UI of the login form
  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        

        /*Align(
          alignment: Alignment.centerLeft,
          child:const Text("Username",
            style: TextStyle(
              fontSize: 15,
            ),
          ),
        ),

        const SizedBox(height: 6),*/
        
        TextField(
          controller: _usernameController,

          decoration: InputDecoration(
            labelText: "Username",
            hintText: "Enter your username",
            prefixIcon: Icon(Icons.person),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
        
        const SizedBox(height: 20),

        /*Align(
          alignment: Alignment.centerLeft,
          child:const Text("Password",
            style: TextStyle(
              fontSize: 15,
            ),
          ),
        ),

        const SizedBox(height: 6),*/

        TextField(
          controller: _passwordController,
          obscureText: true,
          decoration: InputDecoration(
            labelText: "Password",
            hintText: "Enter your password",
            prefixIcon: Icon(Icons.lock),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),

        const SizedBox(height: 20),

        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: loading ? null : _login, // Disable button when loading
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0058BE), 
              foregroundColor: Colors.white,
            ),
            
            child: loading
                ? const CircularProgressIndicator(color: Color.fromARGB(255, 32, 34, 53))
                : const Text("Login"),
          ),
        ),

        const SizedBox(height: 12),

        TextButton(
          onPressed: loading ? null : _handleForgotPassword,
          child: const Text("Forgot Password?"),
        ),

        if (errorMsg != null) ...[
          const SizedBox(height: 8),
          Text(errorMsg!, style: const TextStyle(color: Colors.red)),
        ],
        if (resetMsg != null) ...[
          const SizedBox(height: 8),
          Text(resetMsg!, style: const TextStyle(color: Color(0xFF12632D))),
        ],
        
      ],
    );
  }

  
}
