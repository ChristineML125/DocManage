import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'document_card.dart';

class UploadForm extends StatelessWidget {
  final List<Map<String, dynamic>> categories;
  final List<Map<String, dynamic>> departments;
  final PlatformFile? selectedFile;
  final String? selectedCategoryId;
  final String? selectedDepartmentId;
  final bool isUploading;
  final VoidCallback onPickFile;
  final ValueChanged<String> onCategoryChanged;
  final ValueChanged<String> onDepartmentChanged;
  final VoidCallback onCreateCategory;
  final VoidCallback onCreateDepartment;
  final VoidCallback onSubmit;
  final List<Map<String, dynamic>> recentDocs;
  final bool isAdmin;
  final bool isPersonal;

  const UploadForm({
    Key? key,
    required this.categories,
    required this.departments,
    this.selectedFile,
    this.selectedCategoryId,
    this.selectedDepartmentId,
    required this.isUploading,
    required this.onPickFile,
    required this.onCategoryChanged,
    required this.onDepartmentChanged,
    required this.onCreateCategory,
    required this.onCreateDepartment,
    required this.onSubmit,
    required this.recentDocs,
    required this.isAdmin,
    this.isPersonal = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text('Document Intake',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Color(0xFF00685f))),
              Row(
                children: [
                  Icon(Icons.circle, size: 8, color: Color(0xFF00685f)),
                  SizedBox(width: 6),
                  Text('Ready for Upload',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF00685f))),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Upload zone
          Card(
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: InkWell(
              onTap: onPickFile,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
                decoration: BoxDecoration(
                  border: Border.all(color: const Color(0xFFBDC9C5), width: 2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.cloud_upload_outlined, size: 48, color: Color(0xFF00685f)),
                    const SizedBox(height: 12),
                    const Text('Drag and drop file here',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF191C1E))),
                    const SizedBox(height: 8),
                    const Text('Support for PDF, DICOM, JPG (Max 50MB)',
                        style: TextStyle(fontSize: 14, color: Color(0xFF6E7A76))),
                    if (selectedFile != null) ...[
                      const SizedBox(height: 12),
                      Text(selectedFile!.name,
                          style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF00685f))),
                    ],
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Details form
          Card(
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.description_outlined, color: Color(0xFF00685f)),
                      SizedBox(width: 8),
                      Text('Document Details',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF191C1E))),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (!isPersonal) ...[
                    _label('Document Category'),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: selectedCategoryId,
                            decoration: _decoration('Select Category'),
                            items: categories
                                .map((c) => DropdownMenuItem<String>(
                                      value: c['id']?.toString(),
                                      child: Text(c['name'] ?? ''),
                                    ))
                                .toList(),
                            onChanged: (v) => onCategoryChanged(v!),
                          ),
                        ),
                        const SizedBox(width: 8),
                        _iconBtn(Icons.add, onCreateCategory),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _label('Assign to Department'),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: selectedDepartmentId,
                            decoration: _decoration('Select Department'),
                            items: departments
                                .map((d) => DropdownMenuItem<String>(
                                      value: d['id']?.toString(),
                                      child: Text(d['departmentName'] ?? d['name'] ?? ''),
                                    ))
                                .toList(),
                            onChanged: (v) => onDepartmentChanged(v!),
                          ),
                        ),
                        const SizedBox(width: 8),
                        _iconBtn(Icons.add, onCreateDepartment),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00685f),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: isUploading ? null : onSubmit,
                      icon: isUploading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Icon(Icons.save, size: 18),
                      label: Text(isUploading ? 'Uploading...' : 'Finalize and Store'),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text('Recent Staff Uploads',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF191C1E))),
          const SizedBox(height: 8),
          if (recentDocs.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Center(child: Text('No recent uploads', style: TextStyle(color: Color(0xFF7A8A9A)))),
            )
          else
            ...recentDocs.take(5).map((doc) => DocumentCard(document: doc, isAdmin: isAdmin)),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _label(String text) =>
      Text(text, style: const TextStyle(fontSize: 14, color: Color(0xFF6E7A76)));

  InputDecoration _decoration(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF6E7A76)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFFBDC9C5))),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFFBDC9C5))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFF00685f))),
      );

  Widget _iconBtn(IconData icon, VoidCallback onPressed) => SizedBox(
        width: 48,
        height: 48,
        child: OutlinedButton(
          style: OutlinedButton.styleFrom(
            padding: EdgeInsets.zero,
            side: const BorderSide(color: Color(0xFFBDC9C5)),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          onPressed: onPressed,
          child: Icon(icon, color: const Color(0xFF00685f)),
        ),
      );
}