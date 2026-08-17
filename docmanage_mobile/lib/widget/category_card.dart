import 'package:flutter/material.dart';

class CategoryCard extends StatelessWidget {
  final String name;
  final int docCount;
  final bool isAdmin;
  final VoidCallback onDelete;

  const CategoryCard({
    Key? key,
    required this.name,
    required this.docCount,
    required this.isAdmin,
    required this.onDelete,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final width = (MediaQuery.of(context).size.width - 44) / 2;
    return Container(
      width: width,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFBDC9C5)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFFF2F4F6),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.folder_open,
                    size: 20, color: Color(0xFF006B5E)),
              ),
              if (isAdmin)
                GestureDetector(
                  onTap: onDelete,
                  child: const Icon(Icons.delete_outline,
                      size: 20, color: Color(0xFF6E7A76)),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(name,
              style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF191C1E))),
          const SizedBox(height: 12),   // 替代原来的 Spacer
          const Divider(color: Color(0xFFBDC9C5), height: 1),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.description, size: 14, color: Color(0xFF006B5E)),
              const SizedBox(width: 4),
              Text('$docCount Docs',
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF006B5E))),
            ],
          ),
        ],
      ),
    );
  }
}