// lib/api/user_api.dart
import 'http_service.dart';
import 'department_api.dart';

class UserApi {
  static Future<Map<String, dynamic>> loginUser(
      String username, String password) async {
    try {
      final response = await HttpService.request(
        '/users/login',
        method: 'POST',
        body: {
          'UserName': username,
          'Password': password,
        },
      );
      if (response['token'] != null) {
        final user = response['user'] ?? {};
        await HttpService.saveSession(response['token'], {
          'UserID': user['UserID'],
          'UserName': user['UserName'],
          'role': user['role'],
          'userType': user['userType'] ?? 'company',
          'mustChangePassword': response['mustChangePassword'],
        });
      }
      return response;
    } catch (e) {
      throw Exception('Failed to login: $e');
    }
  }

  static Future<dynamic> getUser(String userId) async {
    return HttpService.request('/users/$userId', method: 'GET');
  }

  static Future<dynamic> updateUser(String userId, Map<String, dynamic> userData) async {
    return HttpService.request('/users/$userId', method: 'PUT', body: userData);
  }

  static Future<dynamic> deleteUser(String userId) async {
    return HttpService.request('/users/$userId', method: 'DELETE');
  }

  // Statistics
  static Future<dynamic> getUsersCount() async {
    return HttpService.request('/users/count', method: 'GET');
  }

  // User list
  static Future<dynamic> getUserList() async {
    return HttpService.request('/users/list', method: 'GET');
  }

  // Create new user
  static Future<dynamic> createUser(Map<String, dynamic> userData) async {
    return HttpService.request('/users', method: 'POST', body: userData);
  }

  // Activate/Deactivate user
  static Future<dynamic> updateUserStatus(int userId, String status) async {
    return HttpService.request(
      '/users/$userId/status',
      method: 'PUT',
      body: {'status': status},
    );
  }

  // Reset password, returns temporary password
  static Future<dynamic> resetPassword(int userId) async {
    return HttpService.request(
      '/users/$userId/reset-password',
      method: 'POST',
    );
  }

  // Generates a password on the server and sends it to the staff member's
  // registered email address. The pending request is removed only on success.
  static Future<dynamic> sendTemporaryPassword(int userId) async {
    return HttpService.request(
      '/users/$userId/send-temp-password',
      method: 'POST',
    );
  }

  // List of pending password reset requests
  static Future<dynamic> getPasswordResetRequests() async {
    return HttpService.request(
      '/users/password-reset-requests',
      method: 'GET',
    );
  }

  // Submit forgot-password request (marks user for admin reset)
  static Future<dynamic> requestPasswordReset(String username) async {
    return HttpService.request(
      '/users/forgot-password',
      method: 'POST',
      body: {'UserName': username},
    );
  }

  static Future<dynamic> changePassword({
    required int userId,
    required String currentPassword,
    required String newPassword,
  }) async {
    return HttpService.request(
      '/users/change-password',
      method: 'PUT',
      body: {
        'userID': userId,
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );
  }

  static Future<dynamic> uploadAvatar(int userId, String filePath) async {
    return HttpService.uploadMultipart(
      '/users/$userId/avatar',
      filePath: filePath,
      fileField: 'avatar',
    );
  }

  // Reuse department API
  static Future<dynamic> getDepartments() async {
    return DepartmentApi.getDepartmentLoad();
  }

  static Future<Map<String, dynamic>> registerPersonal({
    required String username,
    required String password,
    required String email,
  }) async {
    try {
      final response = await HttpService.request(
        '/users/register/personal',
        method: 'POST',
        body: {
          'UserName': username,
          'Password': password,
          'Email': email,
        },
      );
      if (response['token'] != null) {
        final user = response['user'] ?? {};
        await HttpService.saveSession(response['token'], {
          'UserID': user['UserID'],
          'UserName': user['UserName'],
          'role': user['role'],
          'userType': user['userType'] ?? 'personal',
          'mustChangePassword': response['mustChangePassword'],
        });
      }
      return response;
    } catch (e) {
      throw Exception('Failed to register: $e');
    }
  }
}
