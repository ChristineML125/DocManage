import 'package:docmanage_mobile/api/department_api.dart';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

import '../api/document_api.dart';
import '../api/category_api.dart';
import '../widget/upload_form.dart';
import '../widget/upload_successful.dart';
import 'document.dart';


class UploadPage extends StatefulWidget {

  final String role;
  final String userType;

  const UploadPage({
    Key? key,
    required this.role,
    this.userType = 'company',
  }) : super(key: key);


  @override
  State<UploadPage> createState() => _UploadPageState();

}


class _UploadPageState extends State<UploadPage> {

  String? _categoryId;
  String? _departmentId;
  PlatformFile? _file;

  List<Map<String, dynamic>> _categories = [];
  List<Map<String, dynamic>> _departments = [];
  List<Map<String, dynamic>> _recentDocs = [];

  bool _loading = true;
  bool _uploading = false;
  bool _uploadSuccess = false;

  List<String> _lastUploaded = [];


  bool get isAdmin => widget.role.toLowerCase() == 'admin';
  bool get isPersonal => widget.userType == 'personal';


  @override
  void initState() {
    super.initState();
    _loadData();
  }


  Future<void> _loadData() async {
    try {

      if (isPersonal) {
        final docsRes = await DocumentApi.getPersonalDocumentList();
        setState(() {
          _recentDocs = List<Map<String, dynamic>>.from(
            docsRes['documents'] ?? [],
          );
          _loading = false;
        });
        return;
      }

      final docsRes = await DocumentApi.getDocumentList({});
      final categoriesRes = await CategoryApi.getCategories();
      final deptRes = await DepartmentApi.getDepartmentLoad();

      setState(() {

        _categories = List<Map<String, dynamic>>.from(
          categoriesRes['categories'] ?? [],
        );

        _departments = List<Map<String, dynamic>>.from(
          deptRes['departments'] ?? [],
        );

        _recentDocs = List<Map<String, dynamic>>.from(
          docsRes['documents'] ?? [],
        );

        _loading = false;

      });

    } catch (e) {

      setState(() => _loading = false);

      _showMsg('Failed to load data');

    }
  }


  Future<void> _pickFile() async {
    try {
      // Ask user what type of file they want to upload
      final choice = await showModalBottomSheet<String>(
        context: context,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(20),
          ),
        ),
        builder: (context) {
          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    "Select File",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Gallery
                  ListTile(
                    leading: const CircleAvatar(
                      child: Icon(Icons.photo),
                    ),
                    title: const Text("Photo / Image"),
                    subtitle: const Text(
                      "Choose an image from your gallery",
                    ),
                    onTap: () {
                      Navigator.pop(context, "image");
                    },
                  ),

                  // Documents
                  ListTile(
                    leading: const CircleAvatar(
                      child: Icon(Icons.description),
                    ),
                    title: const Text("Document"),
                    subtitle: const Text(
                      "PDF, DOCX, XLSX, TXT and other files",
                    ),
                    onTap: () {
                      Navigator.pop(context, "document");
                    },
                  ),

                  const SizedBox(height: 8),
                ],
              ),
            ),
          );
        },
      );

      if (choice == null) return;

      if (choice == "image") {
        final ImagePicker picker = ImagePicker();

        final XFile? image = await picker.pickImage(
          source: ImageSource.gallery,
        );

        if (image == null) {
          return;
        }

        debugPrint("IMAGE SELECTED: ${image.path}");
        debugPrint("IMAGE NAME: ${image.name}");

        final imageSize = await _getFileSize(image.path);

        if (!mounted) return;

        setState(() {
          _file = PlatformFile(
            name: image.name,
            path: image.path,
            size: imageSize,
          );
        });

        return;
      }

      if (choice == "document") {
        final result = await FilePicker.platform.pickFiles(
          type: FileType.custom,
          allowedExtensions: [
            'pdf',
            'docx',
            'doc',
            'txt',
            'xls',
            'xlsx',
          ],
        );

        if (result == null || result.files.isEmpty) {
          return;
        }

        final selected = result.files.first;

        debugPrint("DOCUMENT SELECTED: ${selected.name}");
        debugPrint("DOCUMENT PATH: ${selected.path}");

        if (selected.path == null) {
          _showMsg(
            "Unable to access the selected file",
          );
          return;
        }

        setState(() {
          _file = selected;
        });
      }
    } catch (e) {
      debugPrint("FILE PICKER ERROR: $e");

      if (!mounted) return;

      _showMsg(
        "Unable to select file: $e",
      );
    }
  }

  Future<int> _getFileSize(String path) async {
    final file = File(path);

    try {
      return await file.length();
    } catch (_) {
      return 0;
    }
  }


  Future<void> _handleUpload() async {

    if (_file == null) {

      _showMsg('Please select a file');

      return;
    }

    if (!isPersonal) {
      if (_categoryId == null || _categoryId!.isEmpty) {
        _showMsg('Please select a category');
        return;
      }

      if (_departmentId == null || _departmentId!.isEmpty) {
        _showMsg('Please select a department');
        return;
      }
    }

    setState(() => _uploading = true);

    try {

      if (isPersonal) {
        await DocumentApi.uploadPersonalDocument(
          filePath: _file!.path!,
        );
      } else {
        await DocumentApi.uploadDocument(
          filePath: _file!.path!,
          categoryId: _categoryId!,
          departmentId: _departmentId!,
        );
      }

      final docsRes = isPersonal
          ? await DocumentApi.getPersonalDocumentList()
          : await DocumentApi.getDocumentList({});

      setState(() {

        _uploadSuccess = true;

        _lastUploaded = [_file!.name];

        _file = null;

        _categoryId = null;

        _departmentId = null;

        _recentDocs = List<Map<String, dynamic>>.from(
          docsRes['documents'] ?? [],
        );

      });

    } catch (e) {

      _showMsg('Upload failed: $e');

    } finally {

      setState(() => _uploading = false);

    }
  }


  void _reset() {

    setState(() {

      _uploadSuccess = false;

      _lastUploaded = [];

    });

  }


  void _showMsg(String msg) {

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
      ),
    );

  }


  Future<void> _createCategory() async {

    final ctrl = TextEditingController();

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Create Category'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(
            hintText: 'Name',
          ),
        ),
        actions: [

          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),

          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Save'),
          ),

        ],
      ),
    );

    if (ok == true && ctrl.text.trim().isNotEmpty) {

      try {

        await CategoryApi.createCategory(
          name: ctrl.text.trim(),
        );

        _showMsg('Category created');

        await _loadData();

      } catch (e) {

        _showMsg('Failed to create category');

      }
    }
  }


  Future<void> _createDepartment() async {

    final ctrl = TextEditingController();

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Create Department'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(
            hintText: 'Name',
          ),
        ),
        actions: [

          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),

          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Save'),
          ),

        ],
      ),
    );

    if (ok == true && ctrl.text.trim().isNotEmpty) {

      try {

        await DepartmentApi.createDepartment(
          ctrl.text.trim(),
        );

        _showMsg('Department created');

        await _loadData();

      } catch (e) {

        _showMsg('Failed to create department');

      }
    }
  }


  @override
  Widget build(BuildContext context) {

    return Scaffold(

      backgroundColor: const Color(0xFFF7F9FB),

      body: _loading
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : _uploadSuccess
              ? UploadSuccessView(
                  lastUploaded: _lastUploaded,
                  recentDocs: _recentDocs,
                  isAdmin: isAdmin,
                   onViewAll: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => Document(role: widget.role, userType: widget.userType),
                    ),
                  ),
                  onReset: _reset,
                )
              : UploadForm(
                  categories: _categories,
                  departments: _departments,
                  selectedFile: _file,
                  selectedCategoryId: _categoryId,
                  selectedDepartmentId: _departmentId,
                  isUploading: _uploading,
                  onPickFile: _pickFile,
                  onCategoryChanged: (v) {
                    setState(() => _categoryId = v);
                  },
                  onDepartmentChanged: (v) {
                    setState(() => _departmentId = v);
                  },
                  onCreateCategory: _createCategory,
                  onCreateDepartment: _createDepartment,
                  onSubmit: _handleUpload,
                  recentDocs: _recentDocs,
                  isAdmin: isAdmin,
                  isPersonal: isPersonal,
                ),

    );
  }

}