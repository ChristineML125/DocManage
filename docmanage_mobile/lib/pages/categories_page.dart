import 'package:flutter/material.dart';
import '../api/category_api.dart';
import '../api/department_api.dart';
import '../widget/category_card.dart';
import '../widget/department_card.dart';
import '../widget/create_category_dialog.dart';
import '../widget/create_department_dialog.dart';

class CategoriesPage extends StatefulWidget {
  final String role;
  const CategoriesPage({Key? key, required this.role}) : super(key: key);

  @override
  State<CategoriesPage> createState() => _CategoriesPageState();
}

class _CategoriesPageState extends State<CategoriesPage> {
  List<Map<String, dynamic>> _categories = [];
  List<Map<String, dynamic>> _departments = [];
  bool _loading = true;

  bool get isAdmin => widget.role.toLowerCase() == 'admin';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final catRes = await CategoryApi.getCategories();
      final deptRes = await DepartmentApi.getDepartmentLoad();
      setState(() {
        _categories = List<Map<String, dynamic>>.from(
            catRes['categories'] ?? []);
        _departments = List<Map<String, dynamic>>.from(
            deptRes['departments'] ?? []);
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      _showMsg('Failed to load data');
    }
  }

  void _showMsg(String msg) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));

  Future<void> _createCategory() async {
    final name = await showDialog<String>(
      context: context,
      builder: (_) => const CreateCategoryDialog(),
    );
    if (name != null && name.trim().isNotEmpty) {
      try {
        await CategoryApi.createCategory(name: name);
        _showMsg('Category created');
        await _loadData();
      } catch (e) {
        _showMsg('Failed to create category');
      }
    }
  }

  Future<void> _deleteCategory(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Category'),
        content: const Text('Are you sure?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete')),
        ],
      ),
    );
    if (confirm == true) {
      try {
        await CategoryApi.deleteCategory(id);
        _showMsg('Category deleted');
        await _loadData();
      } catch (e) {
        _showMsg('Failed to delete category');
      }
    }
  }

  Future<void> _createDepartment() async {
    final name = await showDialog<String>(
      context: context,
      builder: (_) => const CreateDepartmentDialog(),
    );
    if (name != null && name.trim().isNotEmpty) {
      try {
        await DepartmentApi.createDepartment(name);
        _showMsg('Department created');
        await _loadData();
      } catch (e) {
        _showMsg('Failed to create department');
      }
    }
  }

  Future<void> _deleteDepartment(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Department'),
        content: const Text('Are you sure?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete')),
        ],
      ),
    );
    if (confirm == true) {
      try {
        await DepartmentApi.deleteDepartment(id);
        _showMsg('Department deleted');
        await _loadData();
      } catch (e) {
        _showMsg('Failed to delete department');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7F9FB),
        elevation: 0,
        title: const Text('Categories',
            style: TextStyle(color: Color(0xFF006B5E), fontWeight: FontWeight.w600)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sectionHeader(
                      'Document Categories',
                      onAdd: _createCategory,
                    ),
                    const SizedBox(height: 12),
                    _buildCategoryGrid(),
                    const SizedBox(height: 24),
                    _sectionHeader(
                      'Department Categories',
                      onAdd: _createDepartment,
                    ),
                    const SizedBox(height: 12),
                    _buildDepartmentGrid(),
                    const SizedBox(height: 80),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _sectionHeader(String title, {VoidCallback? onAdd}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title,
            style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: Color(0xFF191C1E))),
        if (onAdd != null)
          GestureDetector(
            onTap: onAdd,
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFF006B5E),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.add, color: Colors.white, size: 24),
            ),
          ),
      ],
    );
  }

  Widget _buildCategoryGrid() {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        ..._categories.map((cat) => CategoryCard(
              name: cat['name'] ?? '',
              docCount: cat['docCount'] ?? 0,
              isAdmin: isAdmin,
              onDelete: () {
                final rawId = cat['id'];
                final id = rawId is int
                    ? rawId
                    : int.tryParse(rawId?.toString() ?? '') ?? -1;
                if (id != -1) _deleteCategory(id);
              },
            )),
        _buildAddCard('New Category', onTap: _createCategory),
      ],
    );
  }

  Widget _buildDepartmentGrid() {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        ..._departments.map((dept) => DepartmentCard(
              name: dept['departmentName'] ?? '',
              docCount: dept['documentCount'] ?? 0,
              isAdmin: isAdmin,
              onDelete: () => _deleteDepartment(dept['id']?.toString() ?? ''),
            )),
        _buildAddCard('New Department', onTap: _createDepartment),
      ],
    );
  }

  Widget _buildAddCard(String label, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: (MediaQuery.of(context).size.width - 44) / 2,
        constraints: const BoxConstraints(minHeight: 140),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFBDC9C5), width: 2),
          borderRadius: BorderRadius.circular(12),
          color: Colors.white.withOpacity(0.5),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.add_box_outlined,
                size: 40, color: Color(0xFF6E7A76)),
            const SizedBox(height: 8),
            Text(label,
                style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF191C1E))),
          ],
        ),
      ),
    );
  }
}