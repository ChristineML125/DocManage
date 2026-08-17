import 'http_service.dart';

class CategoryApi {

  static Future<Map<String, dynamic>> getCategories() async {
    try {
      final response = await HttpService.request(
        '/categories',
        method: 'GET',
      );

      return response;

    } catch (e) {

      return {
        "success": false,
        "message": e.toString()
      };

    }


  }

  static Future<Map<String, dynamic>> getCategory(int categoryId) async {
    try {

      final response = await HttpService.request(
        '/categories/$categoryId',
        method: 'GET',
      );

      return response;

    } catch (e) {

      return {
        "success": false,
        "message": e.toString()
      };

    }


  }

  static Future<Map<String, dynamic>> createCategory({
    required String name,
    String description = '',
  }) async {
    try {

      final response = await HttpService.request(
        '/categories',
        method: 'POST',
        body: {
          "name": name,
          "description": description
        },
      );

      return response;

    } catch (e) {

      return {
        "success": false,
        "message": e.toString()
      };

    }

  }

  static Future<Map<String, dynamic>> updateCategory({
    required int categoryId,
    required String name,
    String description = '',
  }) async {
    try {

      final response = await HttpService.request(
        '/categories/$categoryId',
        method: 'PUT',
        body: {
          "name": name,
          "description": description
        },
      );

      return response;

    } catch (e) {

      return {
        "success": false,
        "message": e.toString()
      };

    }


  }

  static Future<Map<String, dynamic>> deleteCategory(int categoryId) async {
    try {

      final response = await HttpService.request(
        '/categories/$categoryId',
        method: 'DELETE',
      );

      return response;

    } catch (e) {

      return {
        "success": false,
        "message": e.toString()
      };

    }


  }


}
