import 'dart:convert';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../api/http_service.dart';
import '../api/user_api.dart';
import 'login_page.dart';

class SettingsPage extends StatefulWidget {
  final int userId;
  final bool forcePasswordChange;
  final String userType;

  const SettingsPage({
    super.key,
    required this.userId,
    this.forcePasswordChange = false,
    this.userType = 'company',
  });

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  Map<String, dynamic>? _user;
  bool _loading = true;
  bool _saving = false;
  bool _showChangePassword = false;
  bool _showEditProfile = false;
  bool _passwordChanged = false;

  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _editUsernameController = TextEditingController();
  final _editEmailController = TextEditingController();

  String? _message;
  bool _isError = false;

  bool get _isPersonal => widget.userType == 'personal';

  @override
  void initState() {
    super.initState();
    _showChangePassword = widget.forcePasswordChange;
    _loadProfile();
  }

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    _editUsernameController.dispose();
    _editEmailController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() => _loading = true);

    try {
      final result = await UserApi.getUser(widget.userId.toString());
      setState(() {
        _user = Map<String, dynamic>.from(result['user'] ?? {});
        _loading = false;
        _editUsernameController.text = _user?['UserName'] ?? '';
        _editEmailController.text = _user?['Email'] ?? '';
      });
    } catch (e) {
      setState(() => _loading = false);
      _setMessage(_parseError(e), isError: true);
    }
  }

  String _parseError(Object e) {
    final raw = e.toString().replaceFirst('Exception: ', '');
    try {
      final decoded = jsonDecode(raw);
      if (decoded is Map && decoded['message'] != null) {
        return decoded['message'].toString();
      }
    } catch (_) {}
    return raw;
  }

  void _setMessage(String message, {bool isError = false}) {
    setState(() {
      _message = message;
      _isError = isError;
    });
  }

  String? _avatarUrl() {
    final avatarPath = _user?['AvatarPath'];

    if (avatarPath == null || avatarPath.toString().isEmpty) {
      return null;
    }

    return HttpService.getFileUrl(
      '/files/${Uri.encodeComponent(avatarPath.toString())}?v=${DateTime.now().millisecondsSinceEpoch}',
    );
  }

  Future<void> _pickAvatar() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      allowMultiple: false,
    );

    if (result == null ||
        result.files.isEmpty ||
        result.files.first.path == null) {
      return;
    }

    setState(() => _saving = true);
    _setMessage('');

    try {
      final uploadResult = await UserApi.uploadAvatar(
        widget.userId,
        result.files.first.path!,
      );

      setState(() {
        _user = {
          ...?_user,
          'AvatarPath': uploadResult['avatarPath'],
        };
      });

_setMessage('Profile photo updated.');
    } catch (e) {
      _setMessage(_parseError(e), isError: true);
    } finally {
      setState(() => _saving = false);
    }
  }
    
  Future<void> _handleChangePassword() async {
    final current = _currentPasswordController.text;
    final newPassword = _newPasswordController.text;
    final confirm = _confirmPasswordController.text;

    if (current.isEmpty || newPassword.isEmpty || confirm.isEmpty) {
      _setMessage('Please complete all password fields.', isError: true);
      return;
    }

    if (newPassword != confirm) {
      _setMessage('New password and confirmation do not match.', isError: true);
      return;
    }

    if (newPassword.length < 8) {
      _setMessage('Password must be at least 8 characters.', isError: true);
      return;
    }

    setState(() => _saving = true);
    _setMessage('');

    try {
      final result = await UserApi.changePassword(
        userId: widget.userId,
        currentPassword: current,
        newPassword: newPassword,
      );

      _currentPasswordController.clear();
      _newPasswordController.clear();
      _confirmPasswordController.clear();

      setState(() {
        _showChangePassword = false;
        _passwordChanged = true;
      });

      _setMessage(result['message'] ?? 'Password changed successfully.');
    } catch (e) {
      _setMessage(_parseError(e), isError: true);
    } finally {
      setState(() => _saving = false);
    }
  }

  void _logout() async {
    await HttpService.clearSession();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginPage()),
      (_) => false,
    );
  }

  Future<void> _saveProfile() async {
    final username = _editUsernameController.text.trim();
    final email = _editEmailController.text.trim();

    if (username.isEmpty || email.isEmpty) {
      _setMessage('Username and email cannot be empty.', isError: true);
      return;
    }

    setState(() => _saving = true);
    _setMessage('');

    try {
      final result = await UserApi.updateUser(widget.userId.toString(), {
        'UserName': username,
        'Email': email,
      });

      if (result['success'] == true) {
        setState(() {
          _showEditProfile = false;
          _user = {
            ...?_user,
            'UserName': username,
            'Email': email,
          };
        });
        _setMessage('Profile updated successfully.');
      } else {
        _setMessage(result['message'] ?? 'Failed to update profile.', isError: true);
      }
    } catch (e) {
      _setMessage(_parseError(e), isError: true);
    } finally {
      setState(() => _saving = false);
    }
  }

  bool get _canLeave =>
      !widget.forcePasswordChange || _passwordChanged;

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: _canLeave,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop && widget.forcePasswordChange && !_passwordChanged) {
          _setMessage('Please change your password before continuing.', isError: true);
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF7F9FB),
        appBar: AppBar(
          backgroundColor: const Color(0xFFF7F9FB),
          elevation: 0,
          foregroundColor: const Color(0xFF191C1E),
          title: const Text(
            'Account Settings',
            style: TextStyle(fontWeight: FontWeight.w600),
          ),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () {
              Navigator.pop(context, true);
            },
          ),
        ),
        body: _loading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (widget.forcePasswordChange)
                      Container(
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF4E5),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFFFD699)),
                        ),
                        child: const Text(
                          'You must change your password before using the app.',
                          style: TextStyle(color: Color(0xFF995E00)),
                        ),
                      ),
                    const Text(
                      'View your account details, update your photo, and manage your password.',
                      style: TextStyle(color: Color(0xFF5F6773)),
                    ),
                    const SizedBox(height: 16),
                    _buildProfileCard(),
                    const SizedBox(height: 16),
                    _buildSecurityCard(),
                    if (_message != null) ...[
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: _isError
                              ? const Color(0xFFFFF0F0)
                              : const Color(0xFFE8F7ED),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _message!,
                          style: TextStyle(
                            color: _isError
                                ? const Color(0xFFA51F1F)
                                : const Color(0xFF12632D),
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _logout,
                        icon: const Icon(Icons.logout),
                        label: const Text('Log out'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFFA51F1F),
                          side: const BorderSide(color: Color(0xFFE3B4B4)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
                    const SizedBox(height: 80),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildProfileCard() {
    final avatarUrl = _avatarUrl();
    final initial = (_user?['UserName'] ?? 'U').toString()[0].toUpperCase();

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFFD7DBE2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _sectionHeader(Icons.person, 'Profile', 'Your current account information.'),
            const SizedBox(height: 16),
            Row(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundColor: const Color(0xFFE7EEF9),
                  backgroundImage: avatarUrl != null
                      ? NetworkImage(
                          avatarUrl,
                          headers: HttpService.authorizationHeaders,
                        )
                      : null,
                  child: avatarUrl == null
                      ? Text(
                          initial,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF005e53),
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 16),
                OutlinedButton(
                  onPressed: _saving ? null : _pickAvatar,
                  child: Text(_saving ? 'Saving...' : 'Change photo'),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _detailGrid(),
          ],
        ),
      ),
    );
  }

  Widget _buildSecurityCard() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFFD7DBE2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _sectionHeader(Icons.security, 'Security', 'Use your current password to set a new one.'),
            const SizedBox(height: 16),
            Row(
              children: [
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Password',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Choose a password with at least 8 characters.',
                        style: TextStyle(color: Color(0xFF5F6773), fontSize: 13),
                      ),
                    ],
                  ),
                ),
                OutlinedButton(
                  onPressed: _saving
                      ? null
                      : () {
                          setState(() {
                            _showChangePassword = !_showChangePassword;
                            _message = null;
                          });
                        },
                  child: Text(_showChangePassword ? 'Cancel' : 'Change password'),
                ),
              ],
            ),
            if (_showChangePassword) ...[
              const Divider(height: 32),
              _passwordField('Current password', _currentPasswordController),
              const SizedBox(height: 12),
              _passwordField('New password', _newPasswordController),
              const SizedBox(height: 12),
              _passwordField('Confirm new password', _confirmPasswordController),
              const SizedBox(height: 16),
              Align(
                alignment: Alignment.centerRight,
                child: ElevatedButton(
                  onPressed: _saving ? null : _handleChangePassword,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF091426),
                    foregroundColor: Colors.white,
                  ),
                  child: Text(_saving ? 'Saving...' : 'Save password'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(IconData icon, String title, String subtitle) {
    return Row(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: const BoxDecoration(
            color: Color(0xFF005e53),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: Colors.white, size: 22),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                subtitle,
                style: const TextStyle(
                  color: Color(0xFF5F6773),
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _detailGrid() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _detailField('Username', _user?['UserName'] ?? '—')),
            const SizedBox(width: 12),
            Expanded(child: _detailField('Email', _user?['Email'] ?? 'Not available')),
          ],
        ),
        if (!_isPersonal) ...[
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _detailField('Role', _user?['role'] ?? '—')),
              const SizedBox(width: 12),
              Expanded(
                child: _detailField(
                  'Department',
                  _user?['departmentName'] ?? 'Not assigned',
                ),
              ),
            ],
          ),
        ],
        const SizedBox(height: 12),
        _detailField('Account status', _user?['StatusName'] ?? 'Active'),
        const SizedBox(height: 16),
        if (_showEditProfile) ...[
          const Divider(height: 1),
          const SizedBox(height: 16),
          _editField('Username', _editUsernameController),
          const SizedBox(height: 12),
          _editField('Email', _editEmailController),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              OutlinedButton(
                onPressed: _saving
                    ? null
                    : () {
                        setState(() {
                          _showEditProfile = false;
                          _editUsernameController.text = _user?['UserName'] ?? '';
                          _editEmailController.text = _user?['Email'] ?? '';
                        });
                      },
                child: const Text('Cancel'),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: _saving ? null : _saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF005e53),
                  foregroundColor: Colors.white,
                ),
                child: Text(_saving ? 'Saving...' : 'Save changes'),
              ),
            ],
          ),
        ] else ...[
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                setState(() {
                  _showEditProfile = true;
                  _message = null;
                });
              },
              icon: const Icon(Icons.edit, size: 18),
              label: const Text('Edit Profile'),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF005e53),
                side: const BorderSide(color: Color(0xFF005e53)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _detailField(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF5F6773),
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Color(0xFFCFD4DC)),
          ),
          child: Text(value),
        ),
      ],
    );
  }

  Widget _editField(String label, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF5F6773),
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
        ),
      ],
    );
  }

  Widget _passwordField(String label, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF5F6773),
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          obscureText: true,
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
        ),
      ],
    );
  }
}
