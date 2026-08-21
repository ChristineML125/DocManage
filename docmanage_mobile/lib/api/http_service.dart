import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class HttpService {
  static const String baseUrl =
      'https://docmanage-1.onrender.com/api';
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'auth_user';

  static String? token;
  static Map<String, dynamic>? savedUser;

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    token = prefs.getString(_tokenKey);
    final userStr = prefs.getString(_userKey);
    if (userStr != null) {
      savedUser = jsonDecode(userStr);
    }
  }

  static Future<void> saveSession(String tokenValue, Map<String, dynamic> user) async {
    token = tokenValue;
    savedUser = user;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, tokenValue);
    await prefs.setString(_userKey, jsonEncode(user));
  }

  static Future<void> clearSession() async {
    token = null;
    savedUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  static String getFileUrl(String fileUrl) {
    if (fileUrl.trim().isEmpty) {
      return '';
    }

    final file = fileUrl.trim();

    // Already a full URL
    if (file.startsWith('http://') ||
        file.startsWith('https://')) {
      return file;
    }

    final serverUrl = baseUrl.replaceFirst('/api', '');

    // Already starts with /files/
    if (file.startsWith('/files/')) {
      return '$serverUrl$file';
    }

    // Starts with files/
    if (file.startsWith('files/')) {
      return '$serverUrl/$file';
    }

    // Bare filename
    return '$serverUrl/files/$file';
  }  

  static Map<String, String>
      get authorizationHeaders => {
            if (token != null)
              'Authorization':
                  'Bearer $token',
          };

  static Future<dynamic> request(
    String url, {
    String method = 'GET',
    dynamic body,
  }) async {
    final headers = {
      'Content-Type':
          'application/json',
      if (token != null)
        'Authorization':
            'Bearer $token',
    };

    late http.Response response;

    final uri =
        Uri.parse('$baseUrl$url');

    if (method == 'POST') {
      response = await http.post(
        uri,
        headers: headers,
        body: body != null
            ? jsonEncode(body)
            : null,
      );
    } else if (method == 'PUT') {
      response = await http.put(
        uri,
        headers: headers,
        body: body != null
            ? jsonEncode(body)
            : null,
      );
    } else if (method == 'DELETE') {
      response = await http.delete(
        uri,
        headers: headers,
      );
    } else {
      response = await http.get(
        uri,
        headers: headers,
      );
    }

    print(
      'HTTP ${response.statusCode}: '
      '${response.body}',
    );

    final isHtml = response.body.trimLeft().startsWith('<!') ||
        response.body.trimLeft().startsWith('<html');

    if (response.statusCode >= 400) {
      if (isHtml) {
        throw Exception('Server is temporarily unavailable. Please try again.');
      }
      try {
        final parsed = jsonDecode(response.body);
        throw Exception(parsed['message'] ?? 'Request failed');
      } catch (e) {
        if (e is Exception) rethrow;
        throw Exception('Request failed (${response.statusCode})');
      }
    }

    if (response.body.isEmpty) {
      return null;
    }

    if (isHtml) {
      throw Exception('Server is temporarily unavailable. Please try again.');
    }

    return jsonDecode(
      response.body,
    );
  }

  static Future<dynamic> uploadMultipart(
    String url, {
    required String filePath,
    required String fileField,
    Map<String, String>? fields,
  }) async {
    final uri =
        Uri.parse('$baseUrl$url');

    final request =
        http.MultipartRequest(
      'POST',
      uri,
    );

    if (token != null) {
      request.headers[
              'Authorization'] =
          'Bearer $token';
    }

    request.files.add(
      await http.MultipartFile.fromPath(
        fileField,
        filePath,
      ),
    );

    if (fields != null) {
      request.fields.addAll(
        fields,
      );
    }

    final streamedResponse =
        await request.send();

    final response =
        await http.Response.fromStream(
      streamedResponse,
    );

    print(
      'HTTP ${response.statusCode}: '
      '${response.body}',
    );

    final isHtml2 = response.body.trimLeft().startsWith('<!') ||
        response.body.trimLeft().startsWith('<html');

    if (response.statusCode >= 400) {
      if (isHtml2) {
        throw Exception('Server is temporarily unavailable. Please try again.');
      }
      try {
        final parsed = jsonDecode(response.body);
        throw Exception(parsed['message'] ?? 'Upload failed');
      } catch (e) {
        if (e is Exception) rethrow;
        throw Exception('Upload failed (${response.statusCode})');
      }
    }

    if (response.body.isEmpty) {
      return null;
    }

    if (isHtml2) {
      throw Exception('Server is temporarily unavailable. Please try again.');
    }

    return jsonDecode(
      response.body,
    );
  }
}