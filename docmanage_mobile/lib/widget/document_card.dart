import 'package:flutter/material.dart';

import '../pages/document_preview.dart';
import '../api/document_api.dart';

class DocumentCard extends StatelessWidget {
  final Map<String, dynamic> document;
  final bool isAdmin;
  final bool isPersonal;
  final VoidCallback? onUpdated;
  final bool isFavorited;
  final VoidCallback? onToggleFavorite;

  const DocumentCard({
    super.key,
    required this.document,
    required this.isAdmin,
    this.isPersonal = false,
    this.onUpdated,
    this.isFavorited = false,
    this.onToggleFavorite,
  });

  Icon getFileIcon(String filePath) {
    if (filePath.isEmpty) {
      return const Icon(Icons.insert_drive_file);
    }

    String type = filePath.split('.').last.toLowerCase();

    switch (type) {
      case "pdf":
        return const Icon(
          Icons.picture_as_pdf,
          color: Colors.red,
        );
      case "docx":
        return const Icon(
          Icons.description,
          color: Colors.blue,
        );
      case "xlsx":
        return const Icon(
          Icons.table_chart,
          color: Colors.green,
        );
      default:
        return const Icon(
          Icons.insert_drive_file,
        );
    }
  }

  void openPreview(BuildContext context) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => DocumentPreview(
            document: document,
            isPersonal: isPersonal,
          ),
        ),
      );

      debugPrint("Open preview: ${document["documentName"]}");
  }
  

  void editDocument(BuildContext context) {
    String selectedStatus =
        document["statusName"] ?? "Active";

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text("Edit Document"),
              content: DropdownButtonFormField<String>(
                value: selectedStatus,
                decoration: const InputDecoration(
                  labelText: "Status",
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(
                    value: "Active",
                    child: Text("Active"),
                  ),
                  DropdownMenuItem(
                    value: "Archived",
                    child: Text("Archived"),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setDialogState(() {
                      selectedStatus = value;
                    });
                  }
                },
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: const Text("Cancel"),
                ),
                ElevatedButton(
                  onPressed: () async {
                    try {
                      final result =
                          await DocumentApi.updateDocumentStatus(
                        document["documentID"].toString(),
                        selectedStatus,
                      );

                      if (result["success"] == true) {
                        if (context.mounted) {
                          Navigator.pop(context);
                        }

                        onUpdated?.call();
                      }
                    } catch (e) {
                      debugPrint(
                        "Update document status error: $e",
                      );
                    }
                  },
                  child: const Text("Save"),
                ),
              ],
            );
          },
        );
      },
    );
  }
    
  Future<void> deleteDocument(BuildContext context) async {
    final documentName =
        document["documentName"] ?? "this document";

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Delete Document"),
          content: Text(
            'Are you sure you want to delete "$documentName"?\n\n'
            'This action cannot be undone.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context, false);
              },
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                Navigator.pop(context, true);
              },
              child: const Text("Delete"),
            ),
          ],
        );
      },
    );

    if (confirmed != true) {
      return;
    }

    try {
      final result = await DocumentApi.deleteDocument(
        document["documentID"].toString(),
      );

      if (result["success"] == true) {
        if (!context.mounted) return;

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Document deleted successfully."),
          ),
        );

        // Refresh document list
        onUpdated?.call();
      } else {
        if (!context.mounted) return;

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              result["message"] ?? "Failed to delete document.",
            ),
          ),
        );
      }
    } catch (e) {
      if (!context.mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Delete failed: $e"),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: () {
          openPreview(context);
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    height: 40,
                    width: 40,
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: getFileIcon(
                      document["filePath"] ?? "",
                    ),
                  ),

                  const SizedBox(width: 10),

                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          document["departmentName"] ?? "",
                          style: const TextStyle(
                            color: Colors.grey,
                            fontSize: 11,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),

                        const SizedBox(height: 2),

                        Text(
                          document["documentName"] ?? "Unknown",
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),

                  if (isPersonal && onToggleFavorite != null)
                    IconButton(
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      iconSize: 22,
                      icon: Icon(
                        isFavorited ? Icons.star : Icons.star_border,
                        color: isFavorited ? Colors.amber : Colors.grey,
                      ),
                      onPressed: onToggleFavorite,
                    ),

                  if (isAdmin)
                    PopupMenuButton<String>(
                      padding: EdgeInsets.zero,
                      iconSize: 20,
                      onSelected: (value) {
                        if (value == "edit") {
                          editDocument(context);
                        } else if (value == "delete") {
                          deleteDocument(context);
                        }
                      },
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: "edit",
                          child: Row(
                            children: [
                              Icon(
                                Icons.edit,
                                size: 18,
                              ),
                              SizedBox(width: 8),
                              Text("Edit"),
                            ],
                          ),
                        ),

                        const PopupMenuItem(
                          value: "delete",
                          child: Row(
                            children: [
                              Icon(
                                Icons.delete,
                                size: 18,
                                color: Colors.red,
                              ),
                              SizedBox(width: 8),
                              Text("Delete"),
                            ],
                          ),
                        ),
                      ],
                    ),
                ],
              ),

              const SizedBox(height: 10),

              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 9,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: document["statusName"] == "Archived"
                          ? Colors.orange.shade100
                          : Colors.blue.shade100,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      document["statusName"] ?? "Active",
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: document["statusName"] == "Archived"
                            ? Colors.orange.shade800
                            : Colors.blue.shade800,
                      ),
                    ),
                  ),

                  const SizedBox(width: 8),

                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 9,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      "V ${document["versionNum"] ?? 1}",
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),

                  const Spacer(),

                  Text(
                    document["updateDate"] ?? "Recently updated",
                    style: const TextStyle(
                      color: Colors.grey,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}