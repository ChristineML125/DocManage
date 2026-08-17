import 'package:flutter/material.dart';
import '../api/audit_log_api.dart';
import 'package:intl/intl.dart';

class AuditLogView extends StatefulWidget {
  const AuditLogView({Key? key}) : super(key: key);

  @override
  State<AuditLogView> createState() => _AuditLogViewState();
}

class _AuditLogViewState extends State<AuditLogView> {
  List<Map<String, dynamic>> _logs = [];
  Map<String, dynamic>? _selectedLog;
  String _timeFilter = 'all', _actionFilter = 'all', _entityFilter = 'all';
  int _currentPage = 1;
  final int _pageSize = 8;

  @override
  void initState() {
    super.initState();
    _loadLogs();
  }

  Future<void> _loadLogs() async {
    final res = await AuditLogApi.getAuditLogs();
    if (res['success']) {
      setState(() => _logs = List<Map<String, dynamic>>.from(res['auditLog'] ?? []));
    }
  }

  List<Map<String, dynamic>> get _filteredLogs {
    var logs = [..._logs];
    final now = DateTime.now();

    if (_timeFilter == 'today') {
      logs = logs.where((l) {
        final date = DateTime.tryParse(l['timestamp'] ?? '');
        return date != null && date.year == now.year && date.month == now.month && date.day == now.day;
      }).toList();
    } else if (_timeFilter == 'last7') {
      logs = logs.where((l) {
        final date = DateTime.tryParse(l['timestamp'] ?? '');
        return date != null && now.difference(date).inDays <= 7;
      }).toList();
    } else if (_timeFilter == 'last30') {
      logs = logs.where((l) {
        final date = DateTime.tryParse(l['timestamp'] ?? '');
        return date != null && now.difference(date).inDays <= 30;
      }).toList();
    }

    if (_actionFilter != 'all') {
      logs = logs.where((l) => (l['Action'] ?? '').toLowerCase().contains(_actionFilter)).toList();
    }

    if (_entityFilter != 'all') {
      logs = logs.where((l) => (l['targetEntity'] ?? '') == _entityFilter).toList();
    }

    return logs;
  }

  List<Map<String, dynamic>> get _paginatedLogs {
    final start = (_currentPage - 1) * _pageSize;
    final end = start + _pageSize;
    final filtered = _filteredLogs;
    if (filtered.isEmpty) return [];
    return filtered.sublist(start, end > filtered.length ? filtered.length : end);
  }

  int get _totalPages => (_filteredLogs.length / _pageSize).ceil();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildDropdown(['all', 'today', 'last7', 'last30'], _timeFilter,
                    (v) => setState(() { _timeFilter = v!; _currentPage = 1; })),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildDropdown(['all', 'insert', 'delete', 'create', 'block', 'preview', 'update'],
                    _actionFilter, (v) => setState(() { _actionFilter = v!; _currentPage = 1; })),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildDropdown(['all', 'Document', 'User'], _entityFilter,
                    (v) => setState(() { _entityFilter = v!; _currentPage = 1; })),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('All Audit Logs', style: TextStyle(fontWeight: FontWeight.w600)),
              Text('${_filteredLogs.length} Audit Logs', style: const TextStyle(color: Color(0xFF5A6A7A))),
            ],
          ),
          const SizedBox(height: 12),
          if (_paginatedLogs.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Column(
                  children: [
                    Icon(Icons.history, size: 64, color: Color(0xFFDCE4ED)),
                    const SizedBox(height: 12),
                    Text(
                      "No audit logs available",
                      style: TextStyle(fontSize: 15, color: Color(0xFF7A8A9A)),
                    ),
                  ],
                ),
              ),
            )
          else ..._paginatedLogs.map((log) => _buildLogCard(log)),
          if (_totalPages > 1)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left),
                  onPressed: _currentPage > 1 ? () => setState(() => _currentPage--) : null,
                ),
                Text('Page $_currentPage of $_totalPages'),
                IconButton(
                  icon: const Icon(Icons.chevron_right),
                  onPressed: _currentPage < _totalPages ? () => setState(() => _currentPage++) : null,
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildDropdown(List<String> items, String current, ValueChanged<String?> onChanged) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFDCE2EA)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: current,
          isExpanded: true,
          style: const TextStyle(fontSize: 13, color: Color(0xFF1E293B)),
          items: items
              .map((e) => DropdownMenuItem(value: e, child: Text(e == 'all' ? 'All' : e.toUpperCase())))
              .toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  String _formatTimestamp(dynamic timestamp) {
    if (timestamp == null || timestamp.toString().isEmpty) {
      return '';
    }

    try {
      final date = DateTime.parse(timestamp.toString()).toLocal();

      return DateFormat('dd MMM yyyy, hh:mm a').format(date);
    } catch (e) {
      return timestamp.toString();
    }
  }

  Widget _buildLogCard(Map<String, dynamic> log) {
    final isSelected = _selectedLog?['id'] == log['id'];

    return GestureDetector(
      onTap: () => setState(() => _selectedLog = log),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFFEEF6FF)
              : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF00685F)
                : const Color(0xFFEEF2F6),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.access_time,
                  size: 14,
                  color: Color(0xFF5A6A7A),
                ),

                const SizedBox(width: 4),

                Text(
                  _formatTimestamp(log['timestamp']),
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF5A6A7A),
                  ),
                ),

                const Spacer(),

                Text(
                  log['Action'] ?? '',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF005FAF),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 4),

            Text(
              log['UserName'] ?? '',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
              ),
            ),

            Text(
              'Target: ${log['targetEntity'] ?? 'N/A'} (${log['targetID'] ?? ''})',
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF3E4946),
              ),
            ),
          ],
        ),
      ),
    );
  }

}