import 'package:flutter/material.dart';

class DepartmentLoad extends StatelessWidget {

  final List<Map<String, dynamic>> departments;

  const DepartmentLoad({
    super.key,
    required this.departments,
  });


  @override
  Widget build(BuildContext context) {

    return Card(

      elevation: 3,

      child: Padding(
        padding: const EdgeInsets.all(16),

        child: Column(

          crossAxisAlignment: CrossAxisAlignment.start,

          children: [

            const Text(
              "Department Load",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),


            const SizedBox(height: 15),


            ...departments.map((dept){

              return Padding(

                padding: const EdgeInsets.only(bottom:15),

                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,

                  children: [
                  Row(
                    mainAxisAlignment:
                        MainAxisAlignment.spaceBetween,

                    children: [
                      Text(
                        dept["departmentName"] ?? "",
                      ),
                      Text(
                        "${dept["percentage"]}%",
                      ),

                    ],
                  ),

                    const SizedBox(height:5),

                    LinearProgressIndicator(

                      value: (dept["percentage"] ?? 0) / 100,

                    ),

                  ],

                ),

              );

            }),

          ],

        ),
      ),
    );
  }
}