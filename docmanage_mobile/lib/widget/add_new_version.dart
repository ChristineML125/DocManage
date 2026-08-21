import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../api/document_api.dart';

class AddNewVersionDialog extends StatefulWidget {
  final String documentId;
  final Future<void> Function() onUploaded;

  const AddNewVersionDialog({
    super.key,
    required this.documentId,
    required this.onUploaded,
  });

  @override
  State<AddNewVersionDialog> createState() =>
      _AddNewVersionDialogState();
}

class _AddNewVersionDialogState
    extends State<AddNewVersionDialog> {
  String? selectedFile;
  String? selectedFileName;

  bool uploading = false;

  Future<void> pickFile() async {
    if (uploading) {
      return;
    }

    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: [
        'pdf',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'png',
        'jpg',
        'jpeg',
      ],
    );

    if (result == null) {
      return;
    }

    final file = result.files.single;

    if (file.path == null) {
      return;
    }

    setState(() {
      selectedFile = file.path;
      selectedFileName = file.name;
    });
  }

  Future<void> uploadVersion() async {
    if (selectedFile == null || uploading) {
      return;
    }

    setState(() {
      uploading = true;
    });

    try {
      debugPrint('==============================');
      debugPrint('UPLOAD NEW VERSION');
      debugPrint('DOCUMENT ID: ${widget.documentId}');
      debugPrint('FILE: $selectedFile');
      debugPrint('==============================');

      final response =
          await DocumentApi.uploadNewVersion(
        documentId: widget.documentId,
        filePath: selectedFile!,
      );

      debugPrint(
        'UPLOAD RESPONSE: $response',
      );

      if (!mounted) {
        return;
      }

      if (response != null &&
          response['success'] == true) {
        await widget.onUploaded();

        if (!mounted) {
          return;
        }

        Navigator.pop(context);

        ScaffoldMessenger.of(context)
            .showSnackBar(
          const SnackBar(
            content: Text(
              'New version uploaded successfully.',
            ),
          ),
        );
      } else {
        throw Exception(
          response?['message'] ??
              'Upload failed',
        );
      }
    } catch (e) {
      debugPrint(
        'UPLOAD FAILED: $e',
      );

      if (!mounted) {
        return;
      }

      setState(() {
        uploading = false;
      });

      ScaffoldMessenger.of(context)
          .showSnackBar(
        SnackBar(
          content: Text(
            'Upload failed: $e',
          ),
        ),
      );
    }
  }

  void closeDialog() {
    if (uploading) {
      return;
    }

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
      ),
      title: Row(
        children: [
          const Expanded(
            child: Text(
              'Add New Version',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),

          IconButton(
            onPressed: uploading
                ? null
                : closeDialog,
            icon: const Icon(
              Icons.close,
              size: 20,
            ),
          ),
        ],
      ),

      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          const Text(
            'Upload a new version of this document.',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey,
            ),
          ),

          const SizedBox(
            height: 18,
          ),

          InkWell(
            onTap: uploading
                ? null
                : pickFile,
            borderRadius:
                BorderRadius.circular(14),

            child: Container(
              width: double.infinity,

              padding:
                  const EdgeInsets.symmetric(
                horizontal: 20,
                vertical: 24,
              ),

              decoration: BoxDecoration(
                color: Colors.grey.shade50,

                borderRadius:
                    BorderRadius.circular(14),

                border: Border.all(
                  color: Colors.grey.shade300,
                ),
              ),

              child: Column(
                children: [
                  Icon(
                    selectedFile == null
                        ? Icons
                            .cloud_upload_outlined
                        : Icons
                            .insert_drive_file_outlined,

                    size: 42,

                    color:
                        const Color(0xFF00685f),
                  ),

                  const SizedBox(
                    height: 12,
                  ),

                  Text(
                    selectedFileName ??
                        'Select a file',

                    textAlign:
                        TextAlign.center,

                    maxLines: 2,

                    overflow:
                        TextOverflow.ellipsis,

                    style: TextStyle(
                      fontSize: 13,

                      fontWeight:
                          FontWeight.w600,

                      color:
                          selectedFileName == null
                              ? Colors.grey
                              : Colors.black87,
                    ),
                  ),

                  const SizedBox(
                    height: 6,
                  ),

                  Text(
                    selectedFile == null
                        ? 'PDF, DOCX, XLSX or image'
                        : 'Tap to choose another file',

                    textAlign:
                        TextAlign.center,

                    style: const TextStyle(
                      fontSize: 11,
                      color: Colors.grey,
                    ),
                  ),

                  const SizedBox(
                    height: 14,
                  ),

                  Container(
                    padding:
                        const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),

                    decoration:
                        BoxDecoration(
                      color:
                          Colors.teal.shade50,

                      borderRadius:
                          BorderRadius.circular(8),
                    ),

                    child: const Text(
                      'Browse Files',

                      style: TextStyle(
                        fontSize: 12,

                        fontWeight:
                            FontWeight.w600,

                        color:
                            Color(0xFF00685f),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),

      actions: [
        TextButton(
          onPressed: uploading
              ? null
              : closeDialog,

          child: const Text(
            'Cancel',
          ),
        ),

        ElevatedButton(
          onPressed:
              selectedFile == null ||
                      uploading
                  ? null
                  : uploadVersion,

          style:
              ElevatedButton.styleFrom(
            backgroundColor:
                const Color(0xFF00685f),

            foregroundColor:
                Colors.white,

            shape:
                RoundedRectangleBorder(
              borderRadius:
                  BorderRadius.circular(9),
            ),
          ),

          child: uploading
              ? const SizedBox(
                  width: 18,
                  height: 18,

                  child:
                      CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Text(
                  'Upload Version',
                ),
        ),
      ],
    );
  }
}