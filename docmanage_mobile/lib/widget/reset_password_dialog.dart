import 'package:flutter/material.dart';
import '../api/user_api.dart';

class ResetPasswordDialog extends StatefulWidget {
  final Map<String, dynamic> user;
  const ResetPasswordDialog({Key? key, required this.user}) : super(key: key);

  @override
  State<ResetPasswordDialog> createState() => _ResetPasswordDialogState();
}

class _ResetPasswordDialogState extends State<ResetPasswordDialog> {
  bool _loading = false;
  String? _error;

  Future<void> _sendTemporaryPassword() async {
    setState(() => _loading = true);
    try {
      final res = await UserApi.sendTemporaryPassword(widget.user['UserID']);
      if (!mounted) return;
      if (res['success'] == true) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(res['message'] ?? 'Temporary password sent.')),
        );
        return;
      }
      setState(() => _error = res['message'] ?? 'Unable to send temporary password.');
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Reset User Password'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Send a temporary password to ${widget.user['Email'] ?? 'this user'}.'),
            const SizedBox(height: 8),
            const Text(
              'The staff member must change it in Account Settings after signing in.',
              style: TextStyle(fontSize: 13, color: Color(0xFF5F6773)),
            ),
            const SizedBox(height: 16),
            if (_error != null)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF0F0),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_error!, style: const TextStyle(color: Color(0xFFA51F1F))),
              ),
            ElevatedButton.icon(
              onPressed: _loading ? null : _sendTemporaryPassword,
              icon: const Icon(Icons.email),
              label: Text(_loading ? 'Sending...' : 'Send Temp Password'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
      ],
    );
  }
}
