import 'package:flutter/material.dart';
import 'document_card.dart';

class UploadSuccessView extends StatelessWidget {
  final List<String> lastUploaded;
  final List<Map<String, dynamic>> recentDocs;
  final bool isAdmin;
  final VoidCallback onViewAll;
  final VoidCallback onReset;

  const UploadSuccessView({
    Key? key,
    required this.lastUploaded,
    required this.recentDocs,
    required this.isAdmin,
    required this.onViewAll,
    required this.onReset,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: const Border(left: BorderSide(color: Color(0xFF006B5E), width: 6)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: Color(0xFF006B5E), size: 48),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Upload Successful',
                            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Color(0xFF006B5E))),
                        SizedBox(height: 4),
                        Text('The documents have been securely stored in the clinical repository.',
                            style: TextStyle(color: Color(0xFF3D4947))),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          _batchCard(),
          const SizedBox(height: 20),
          _historyCard(),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00685F),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  onPressed: onViewAll,
                  icon: const Icon(Icons.visibility, size: 18),
                  label: const Text('View All Documents'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF00685F),
                    side: const BorderSide(color: Color(0xFF00685F)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  onPressed: onReset,
                  icon: const Icon(Icons.add_circle_outline, size: 18),
                  label: const Text('Upload Another'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _batchCard() {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFF7FBFF),
              borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
              border: Border(bottom: BorderSide(color: Color(0xFFEEF2F6))),
            ),
            child: Row(
              children: [
                const Text('Recently Processed Batch', style: TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(width: 8),
                Text('${lastUploaded.length} files', style: const TextStyle(color: Color(0xFF7A8A9A))),
              ],
            ),
          ),
          ...lastUploaded.map((name) => Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    const Icon(Icons.insert_drive_file, size: 20, color: Color(0xFF006B5E)),
                    const SizedBox(width: 8),
                    Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.w600))),
                    const Text('Success',
                        style: TextStyle(color: Color(0xFF00685F), fontWeight: FontWeight.w700)),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _historyCard() {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFF7FBFF),
              borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
              border: Border(bottom: BorderSide(color: Color(0xFFEEF2F6))),
            ),
            child: const Text('Recent History', style: TextStyle(fontWeight: FontWeight.w700)),
          ),
          if (recentDocs.isEmpty)
            const Padding(
              padding: EdgeInsets.all(20),
              child: Center(child: Text('No recent uploads', style: TextStyle(color: Color(0xFF7A8A9A)))),
            )
          else
            ...recentDocs.take(5).map((doc) => DocumentCard(document: doc, isAdmin: isAdmin)),
        ],
      ),
    );
  }
}