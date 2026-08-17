import 'package:flutter/material.dart';

class SummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const SummaryCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {

    final screenWidth = MediaQuery.of(context).size.width;

    final iconSize = screenWidth * 0.06; 
    final titleSize = screenWidth * 0.035;
    final valueSize = screenWidth * 0.05;


    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),

      child: Padding(
        padding: EdgeInsets.all(screenWidth * 0.03),

        child: Row(
          children: [

            CircleAvatar(
              radius: screenWidth * 0.06,
              backgroundColor: color,

              child: Icon(
                icon,
                color: Colors.white,
                size: iconSize,
              ),
            ),


            SizedBox(
              width: screenWidth * 0.03,
            ),


            Expanded(
              child: Column(

                crossAxisAlignment:
                    CrossAxisAlignment.start,

                children: [

                  Text(
                    title,

                    overflow: TextOverflow.ellipsis,

                    style: TextStyle(
                      fontSize: titleSize,
                      color: Colors.grey,
                    ),
                  ),


                  SizedBox(height: screenWidth * 0.01),


                  Text(
                    value,

                    style: TextStyle(
                      fontSize: valueSize,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                ],
              ),
            )

          ],
        ),
      ),
    );
  }

}