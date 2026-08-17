import 'package:flutter/material.dart';
import '../api/user_api.dart';
import '../api/http_service.dart';
import 'create_user_dialog.dart';
import 'reset_password_dialog.dart';

class PersonnelView extends StatefulWidget {
  const PersonnelView({Key? key}) : super(key: key);

  @override
  State<PersonnelView> createState() => _PersonnelViewState();
}

class _PersonnelViewState extends State<PersonnelView> {
  List<Map<String, dynamic>> _users = [];
  int _totalUsers = 0, _adminCount = 0, _staffCount = 0;
  List<Map<String, dynamic>> _departments = [];
  List<Map<String, dynamic>> _resetRequests = [];
  bool _loading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final errors = <String>[];

    final userRes = await _safeRequest(
      () => UserApi.getUsersCount(),
      onError: (e) => errors.add('User statistics failed to load: $e'),
    );
    final listRes = await _safeRequest(
      () => UserApi.getUserList(),
      onError: (e) => errors.add('User list failed to load: $e'),
    );
    final deptRes = await _safeRequest(
      () => UserApi.getDepartments(),
      onError: (e) => errors.add('Departments failed to load: $e'),
    );
    final resetRes = await _safeRequest(
      () => UserApi.getPasswordResetRequests(),
      onError: (e) => errors.add('Password reset requests failed to load: $e'),
    );

    if (!mounted) return;

    setState(() {
      if (userRes?['success'] == true) {
        _totalUsers = userRes?['totalUsers'] ?? 0;
        _adminCount = userRes?['adminCount'] ?? 0;
        _staffCount = userRes?['staffCount'] ?? 0;
      }
      if (listRes?['success'] == true) {
        _users = List<Map<String, dynamic>>.from(listRes?['users'] ?? []);
      }
      if (deptRes?['success'] == true) {
        _departments = List<Map<String, dynamic>>.from(deptRes?['departments'] ?? []);
      }
      if (resetRes?['success'] == true) {
        _resetRequests = List<Map<String, dynamic>>.from(resetRes?['requests'] ?? []);
      }
      _errorMessage = errors.isEmpty ? null : errors.join('\n');
      _loading = false;
    });
  }

  Future<Map<String, dynamic>?> _safeRequest(
    Future<dynamic> Function() request, {
    required void Function(dynamic) onError,
  }) async {
    try {
      final result = await request();
      if (result is Map<String, dynamic>) return result;
      return null;
    } catch (e) {
      onError(e);
      return null;
    }
  }

  void _showCreateUserDialog() async {
    final result = await showDialog<Map<String, String>>(
      context: context,
      builder: (_) => CreateUserDialog(departments: _departments),
    );
    if (result != null) {
      await UserApi.createUser({
        'UserName': result['UserName'],
        'Password': result['Password'],
        'Email': result['Email'],
        'DepartmentID': int.parse(result['DepartmentID'] ?? '0'),
        'role': result['role'],
      });
      _loadData();
    }
  }

  void _handleStatusChange(Map<String, dynamic> user) async {
    final newStatus = user['StatusName'] == 'Active' ? 'Inactive' : 'Active';
    final action = newStatus == 'Inactive' ? 'Deactivate' : 'Activate';
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('$action user?'),
        content: Text('Are you sure you want to $action this user?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Confirm')),
        ],
      ),
    );
    if (confirm == true) {
      await UserApi.updateUserStatus(user['UserID'], newStatus);
      _loadData();
    }
  }

  Future<void> _showResetPasswordDialog(Map<String, dynamic> user) async {
    final sent = await showDialog<bool>(
      context: context,
      builder: (_) => ResetPasswordDialog(user: user),
    );
    if (sent == true) _loadData();
  }

  void _showAvatarPreview(Map<String, dynamic> user, String avatarUrl) {
    showDialog(
      context: context,
      builder: (_) => Dialog(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480, maxHeight: 620),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 8, 8),
                child: Row(
                  children: [
                    Expanded(child: Text(user['UserName'] ?? 'Profile photo', style: const TextStyle(fontWeight: FontWeight.w600))),
                    IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
                  ],
                ),
              ),
              Flexible(
                child: InteractiveViewer(
                  child: Image.network(
                    avatarUrl,
                    headers: HttpService.authorizationHeaders,
                    fit: BoxFit.contain,
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          if (_errorMessage != null) ...[
            Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFDECEA),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFF5C6CB)),
              ),
              child: Text(
                _errorMessage!,
                style: const TextStyle(color: Color(0xFF842029), fontSize: 12),
              ),
            ),
          ],
         Row(
            children: [
              Expanded(child: _buildStatCard('Users', _totalUsers.toString(), Icons.group, const Color(0xFF4F46E5))),
              const SizedBox(width: 12),
              Expanded(child: _buildStatCard('Admin', _adminCount.toString(), Icons.admin_panel_settings, const Color(0xFF995E00))),
              const SizedBox(width: 12),
              Expanded(child: _buildStatCard('Staff', _staffCount.toString(), Icons.people, const Color(0xFF005FAF))),
            ],
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00AD57),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            onPressed: _showCreateUserDialog,
            icon: const Icon(Icons.person_add, size: 18),
            label: const Text('Register New User', style: TextStyle(fontWeight: FontWeight.w600)),
          ),
          const SizedBox(height: 16),
          if (_resetRequests.isNotEmpty) ..._buildResetRequestSection(),
          const Text('Personnel Directory', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF071E27))),
          const SizedBox(height: 8),
          ..._users.map((user) => _buildUserCard(user)),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border(top: BorderSide(color: color, width: 4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 14, color: Color(0xFF3E4946))),
              Icon(icon, size: 24, color: color.withOpacity(0.7)),
            ],
          ),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Color(0xFF071E27))),
        ],
      ),
    );
  }

  List<Widget> _buildResetRequestSection() {
    return [
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFF3F7FF),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFB9D2FF)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Password Reset Requests (${_resetRequests.length})', style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            ..._resetRequests.map((req) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(req['UserName'] ?? ''),
                  subtitle: Text(req['Email'] ?? ''),
                  trailing: TextButton(
                    onPressed: () => _showResetPasswordDialog(req),
                    child: const Text('Send Temp Password'),
                  ),
                )),
          ],
        ),
      ),
      const SizedBox(height: 16),
    ];
  }

  Widget _buildUserCard(Map<String, dynamic> user) {
    final userName = (user['UserName'] ?? 'U').toString();
    final initials = userName.isEmpty ? 'U' : userName.substring(0, userName.length.clamp(0, 2)).toUpperCase();
    final avatarPath = user['AvatarPath']?.toString();
    final avatarUrl = avatarPath == null || avatarPath.isEmpty
        ? null
        : HttpService.getFileUrl('/files/${Uri.encodeComponent(avatarPath)}');
    final statusColor = user['StatusName'] == 'Active' ? const Color(0xFF137333) : const Color(0xFF686868);
    final statusBg = user['StatusName'] == 'Active' ? const Color(0xFFE6F4EA) : const Color(0xFFFEE2E2);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEEF2F6)),
      ),
      child: Row(
        children: [
          InkWell(
            onTap: avatarUrl == null ? null : () => _showAvatarPreview(user, avatarUrl),
            borderRadius: BorderRadius.circular(28),
            child: CircleAvatar(
              radius: 24,
              backgroundColor: const Color(0xFFDFF4FF),
              child: avatarUrl == null
                  ? Text(
                      initials,
                      style: const TextStyle(
                        color: Color(0xFF005FAF),
                        fontWeight: FontWeight.w700,
                      ),
                    )
                  : ClipOval(
                      child: Image.network(
                        avatarUrl,
                        width: 48,
                        height: 48,
                        fit: BoxFit.cover,
                        headers: HttpService.authorizationHeaders,
                        errorBuilder: (context, error, stackTrace) {
                          return Text(
                            initials,
                            style: const TextStyle(
                              color: Color(0xFF005FAF),
                              fontWeight: FontWeight.w700,
                            ),
                          );
                        },
                      ),
                    ),
            )
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(user['UserName'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(12)),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: statusColor)),
                          const SizedBox(width: 4),
                          Text(user['StatusName'] ?? '', style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(user['role'] ?? '', style: const TextStyle(color: Color(0xFF3E4946))),
                Text(user['departmentName'] ?? '', style: const TextStyle(color: Color(0xFF005E53), fontSize: 12, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          PopupMenuButton<String>(
            onSelected: (v) {
              if (v == 'status') _handleStatusChange(user);
              if (v == 'reset') _showResetPasswordDialog(user);
            },
            itemBuilder: (_) => [
              PopupMenuItem(
                value: 'status',
                child: Row(children: [
                  Icon(user['StatusName'] == 'Active' ? Icons.block : Icons.check_circle, size: 18),
                  const SizedBox(width: 8),
                  Text(user['StatusName'] == 'Active' ? 'Deactivate' : 'Activate'),
                ]),
              ),
              const PopupMenuItem(
                value: 'reset',
                child: Row(children: [
                  Icon(Icons.lock_reset, size: 18),
                  SizedBox(width: 8),
                  Text('Reset Password'),
                ]),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
