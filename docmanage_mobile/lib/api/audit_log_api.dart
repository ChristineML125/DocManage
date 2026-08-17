import 'http_service.dart';

class AuditLogApi {
  static Future<dynamic> getAuditLogs() async {
    return HttpService.request('/auditlogs', method: 'GET');
  }
}