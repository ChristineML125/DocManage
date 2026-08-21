import 'package:flutter/material.dart';
import '../widget/login_form.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(

      backgroundColor: const Color(0xfff7f9fb),

      body: Center(

        child: SingleChildScrollView (
          child: Padding (

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
                    offset: const Offset(0,10), // changes position of shadow
                  )
                ],
              ),

                child: Column(
                  mainAxisSize: MainAxisSize.min,

                  children: [
                    
                    Container(
                      width: 120,
                      height: 120,
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(18),
                        child: Image.asset(
                          'assets/logo.png',
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),

                    const Text(
                        "Docly",
                        style: TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.bold,
                          color: Color.fromARGB(255, 15, 65, 17),
                        ),
                    ),
                    
                    const SizedBox(height: 20),

                    Align(
                      alignment: Alignment.centerLeft,
                      child: const Text(
                        "Login",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    const LoginForm(),
                  ]
                ),
          
            ),
          ),
          
        ),
      
      )
      
    );
  }
}