import 'package:flutter/material.dart';


class BottomNav extends StatelessWidget {

  final int currentIndex;
  final ValueChanged<int> onTap;
  final bool isAdmin;
  final bool isPersonal;


  const BottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.isAdmin,
    this.isPersonal = false,
  });


  @override
  Widget build(BuildContext context) {

    final destinations = [
      const {
        'icon': Icons.dashboard,
        'label': 'Dashboard',
      },
      const {
        'icon': Icons.description_outlined,
        'label': 'Documents',
      },
      const {
        'icon': Icons.cloud_upload,
        'label': 'Upload',
      },
    ];

    if (!isPersonal) {
      destinations.add(const {
        'icon': Icons.category,
        'label': 'Categories',
      });
    }

    if (isPersonal) {
      destinations.add(const {
        'icon': Icons.star,
        'label': 'Favorites',
      });
    }


    if (isAdmin) {

      destinations.add({
        'icon': Icons.admin_panel_settings,
        'label': 'Admin',
      });

    }


    return Container(

      decoration: const BoxDecoration(

        color: Color(0xFFF7F9FB),

        border: Border(
          top: BorderSide(
            color: Color(0xFFBDC9C5),
          ),
        ),

      ),

      padding: const EdgeInsets.only(
        bottom: 8,
        top: 4,
      ),

      child: SafeArea(

        top: false,

        child: Row(

          mainAxisAlignment: MainAxisAlignment.spaceAround,

          children: List.generate(
            destinations.length,
            (index) {

              final item = destinations[index];

              return _navItem(
                item['icon'] as IconData,
                item['label'] as String,
                index,
              );

            },
          ),

        ),

      ),

    );
  }


  Widget _navItem(
    IconData icon,
    String label,
    int index,
  ) {

    final selected = currentIndex == index;

    final color = selected
        ? const Color(0xFF00685f)
        : const Color(0xFF6E7A76);

    return Expanded(

      child: InkWell(

        onTap: () => onTap(index),

        child: Container(

          margin: const EdgeInsets.symmetric(
            horizontal: 4,
            vertical: 2,
          ),

          padding: const EdgeInsets.symmetric(
            vertical: 6,
          ),

          decoration: selected
              ? BoxDecoration(
                  color: const Color(0xFFB5EBDC),
                  borderRadius: BorderRadius.circular(12),
                )
              : null,

          child: Column(

            mainAxisSize: MainAxisSize.min,

            children: [

              Icon(
                icon,
                color: color,
                size: 24,
              ),

              const SizedBox(
                height: 4,
              ),

              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: selected
                      ? FontWeight.w700
                      : FontWeight.w600,
                  color: color,
                ),
              ),

            ],

          ),

        ),

      ),

    );
  }

}