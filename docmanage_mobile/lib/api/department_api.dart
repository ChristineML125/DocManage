import 'http_service.dart';

class DepartmentApi {
  static Future<dynamic> getDepartmentLoad() async {
    try {
      final response = await HttpService.request(
        '/departments/load',
        method: 'GET',
      );
      return response;
    } catch (e) {
      return {
        "success": false,
        "message": e.toString(),
      };
    }
  }

  static Future<dynamic> createDepartment(String name) async {
    try {
      final response = await HttpService.request(
        '/departments',
        method: 'POST',
        body: {'name': name},
      );
      return response;
    } catch (e) {
      return {
        "success": false,
        "message": e.toString(),
      };
    }
  }

  static Future<dynamic> deleteDepartment(String id) async {
    try {
      final response = await HttpService.request(
        '/departments/$id',
        method: 'DELETE',
      );
      return response;
    } catch (e) {
      return {
        "success": false,
        "message": e.toString(),
      };
    }
  }
}