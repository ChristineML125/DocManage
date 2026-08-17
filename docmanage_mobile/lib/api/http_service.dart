import 'dart:convert';
import 'package:http/http.dart' as http;

class HttpService {
  static const String baseUrl =
      'http://192.168.0.142:3000/api';

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
    
  static String? token;

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

    if (response.statusCode >= 400) {
      throw Exception(
        response.body,
      );
    }

    if (response.body.isEmpty) {
      return null;
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

    if (response.statusCode >= 400) {
      throw Exception(
        response.body,
      );
    }

    if (response.body.isEmpty) {
      return null;
    }

    return jsonDecode(
      response.body,
    );
  }
}