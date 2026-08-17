import 'package:flutter/material.dart';

class UploadZone extends StatelessWidget {
  final VoidCallback onTap;
  final String? selectedFileName;

  const UploadZone({
    Key? key,
    required this.onTap,
    this.selectedFileName,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFBDC9C5), width: 2),
          borderRadius: BorderRadius.circular(12),
          color: Colors.white,
        ),
        child: Column(
          children: [
            const Icon(Icons.cloud_upload_outlined,
                size: 48, color: Color(0xFF006B5E)),
            const SizedBox(height: 12),
            const Text(
              'Drag and drop file here',
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: Color(0xFF191C1E),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Support for PDF, DICOM, JPG (Max 50MB)',
              style: TextStyle(fontSize: 14, color: Color(0xFF6E7A76)),
            ),
            if (selectedFileName != null) ...[
              const SizedBox(height: 12),
              Text(
                selectedFileName!,
                style: const TextStyle(
                    fontWeight: FontWeight.w600, color: Color(0xFF006B5E)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}