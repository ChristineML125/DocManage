import 'package:flutter/material.dart';

class CreateUserDialog extends StatefulWidget {
  final List<Map<String, dynamic>> departments;
  const CreateUserDialog({Key? key, required this.departments}) : super(key: key);

  @override
  State<CreateUserDialog> createState() => _CreateUserDialogState();
}

class _CreateUserDialogState extends State<CreateUserDialog> {
  final _formKey = GlobalKey<FormState>();
  String _userName = '', _password = '', _email = '', _departmentId = '', _role = 'Staff';

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Create New User', style: TextStyle(fontWeight: FontWeight.w600)),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                decoration: const InputDecoration(labelText: 'User Name', hintText: 'Staff Name'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
                onChanged: (v) => _userName = v,
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Password'),
                obscureText: true,
                validator: (v) => v!.isEmpty ? 'Required' : null,
                onChanged: (v) => _password = v,
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Email'),
                onChanged: (v) => _email = v,
              ),
              DropdownButtonFormField<String>(
                value: _departmentId.isEmpty ? null : _departmentId,
                decoration: const InputDecoration(labelText: 'Department'),
                items: widget.departments
                    .map((d) => DropdownMenuItem(
                          value: d['id']?.toString(),
                          child: Text(d['departmentName'] ?? d['name'] ?? ''),
                        ))
                    .toList(),
                onChanged: (v) => _departmentId = v!,
              ),
              DropdownButtonFormField<String>(
                value: _role,
                decoration: const InputDecoration(labelText: 'Role'),
                items: ['Admin', 'Staff'].map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                onChanged: (v) => _role = v!,
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00AD57)),
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              Navigator.pop(context, {
                'UserName': _userName,
                'Password': _password,
                'Email': _email,
                'DepartmentID': _departmentId,
                'role': _role,
              });
            }
          },
          child: const Text('Create'),
        ),
      ],
    );
  }
}