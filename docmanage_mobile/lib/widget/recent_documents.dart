import 'package:flutter/material.dart';
import '../pages/document.dart';

class RecentDocuments extends StatelessWidget {
  final List<Map<String, dynamic>> documents;
  final String role;
  final String userType;

  const RecentDocuments({
    super.key,
    required this.documents,
    required this.role,
    this.userType = 'company',
  });

  String getFileType(String filePath) {
    if (filePath.isEmpty) return '';
    return filePath.split('.').last.toUpperCase();
  }

  Icon getFileIcon(String filePath) {
    final type = getFileType(filePath);
    switch (type) {
      case 'PDF':
        return const Icon(Icons.picture_as_pdf, color: Color(0xFFBA1A1A), size: 24);
      case 'DOCX':
        return const Icon(Icons.description, color: Color(0xFF006B5E), size: 24);
      case 'XLSX':
        return const Icon(Icons.table_chart, color: Color(0xFF34675C), size: 24);
      default:
        return const Icon(Icons.insert_drive_file, color: Color(0xFF6E7A76), size: 24);
    }
  }

  Color _statusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'active':
        return const Color(0xFFB5EBDC);
      case 'archived':
        return const Color(0xFFE0E3E5);
      default:
        return const Color(0xFFE0E3E5);
    }
  }

  Color _statusTextColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'active':
        return const Color(0xFF00201A);
      case 'archived':
        return const Color(0xFF3E4946);
      default:
        return const Color(0xFF3E4946);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: const Color(0xFFFFFFFF),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recent Documents',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF191C1E),
                  ),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => Document(role: role, userType: userType), 
                      ),
                    );
                  },
                  child: Row(
                    children: const [
                      Text(
                        'View All',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF006B5E),
                        ),
                      ),
                      SizedBox(width: 4),
                      Icon(Icons.arrow_forward, size: 16, color: Color(0xFF006B5E)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...documents.take(5).map((doc) {
              final fileName = doc['documentName'] ?? 'Unknown';
              final department = doc['departmentName'] ?? '';
              final category = doc['categoriesName'] ?? '';
              final fileType = getFileType(doc['filePath'] ?? '');
              final status = doc['statusName'] ?? 'Active';
              final version = doc['versionNum']?.toString() ?? '1';

              return ListTile(
                contentPadding: const EdgeInsets.symmetric(vertical: 4),
                leading: getFileIcon(doc['filePath'] ?? ''),
                title: Text(
                  fileName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: Color(0xFF191C1E),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text(
                  '$department • $category • $fileType • v.$version',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF6E7A76),
                  ),
                ),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: _statusColor(status),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    status,
                    style: TextStyle(
                      color: _statusTextColor(status),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}