import 'http_service.dart';

class DocumentApi {
  // =========================================================
  // DOCUMENTS
  // =========================================================

  static Future getDocuments() async {
    return HttpService.request(
      '/documents/count',
      method: 'GET',
    );
  }

  static Future getPersonalDocCount() async {
    return HttpService.request(
      '/documents/my/count',
      method: 'GET',
    );
  }

  static Future getDocumentList(
    Map<String, dynamic> params,
  ) async {
    return HttpService.request(
      '/documents/list',
      method: 'GET',
    );
  }

  static Future getPersonalDocumentList() async {
    return HttpService.request(
      '/documents/my',
      method: 'GET',
    );
  }

  static Future getDocument(
    String id,
  ) async {
    return HttpService.request(
      '/documents/$id',
      method: 'GET',
    );
  }

  // =========================================================
  // UPLOAD
  // =========================================================

  static Future uploadDocument({
    required String filePath,
    required String categoryId,
    required String departmentId,
  }) async {
    return HttpService.uploadMultipart(
      '/documents/upload',
      filePath: filePath,
      fileField: 'file',
      fields: {
        'categoryId': categoryId,
        'departmentId': departmentId,
      },
    );
  }

  static Future uploadPersonalDocument({
    required String filePath,
  }) async {
    return HttpService.uploadMultipart(
      '/documents/personal/upload',
      filePath: filePath,
      fileField: 'file',
    );
  }

  static Future uploadNewVersion({
    required String documentId,
    required String filePath,
  }) async {
    return HttpService.uploadMultipart(
      '/documents/$documentId/version',
      filePath: filePath,
      fileField: 'file',
    );
  }

  // =========================================================
  // DELETE / DOWNLOAD
  // =========================================================

  static Future deleteDocument(
    String id,
  ) async {
    return HttpService.request(
      '/documents/$id',
      method: 'DELETE',
    );
  }

  static Future downloadDocument(
    String id,
  ) async {
    return HttpService.request(
      '/documents/$id/download',
      method: 'GET',
    );
  }

  static Future updateDocumentStatus(
    String id,
    String statusName,
  ) async {
    return HttpService.request(
      '/documents/$id/status',
      method: 'PUT',
      body: {
        'statusName': statusName,
      },
    );
  }

  // =========================================================
  // PREVIEW
  // =========================================================

  static Future previewDocument(
    String id,
  ) async {
    return HttpService.request(
      '/documents/$id/preview',
      method: 'POST',
    );
  }

  static Future getPreviewPdf(
    String id,
  ) async {
    return HttpService.request(
      '/documents/export',
      method: 'POST',
      body: {
        'documentID': id,
      },
    );
  }

  static Future previewDocumentVersion({
    required String documentId,
    required String versionId,
  }) async {
    return HttpService.request(
      '/documents/$documentId/versions/$versionId/file',
      method: 'GET',
    );
  }

  // =========================================================
  // AI SUMMARY
  // =========================================================

  static Future getAISummary(
    String id,
  ) async {
    return HttpService.request(
      '/documents/$id/summary',
      method: 'GET',
    );
  }

  static Future generateAISummary(
    String id,
  ) async {
    return HttpService.request(
      '/documents/$id/generate-summary',
      method: 'POST',
    );
  }

  // =========================================================
  // EXPORT
  // =========================================================

  static Future exportPDF(
    String id,
  ) async {
    return HttpService.request(
      '/documents/export',
      method: 'POST',
      body: {
        'documentID': id,
      },
    );
  }

  static Future exportDOCX(
    String id,
  ) async {
    return HttpService.request(
      '/documents/export-docx',
      method: 'POST',
      body: {
        'documentID': id,
      },
    );
  }

  static Future exportXLSX(
    String id,
  ) async {
    return HttpService.request(
      '/documents/export-xlsx',
      method: 'POST',
      body: {
        'documentID': id,
      },
    );
  }

  // =========================================================
  // VERSION HISTORY
  // =========================================================

  static Future getVersionList(
    String id,
  ) async {
    return HttpService.request(
      '/documents/$id/versions',
      method: 'GET',
    );
  }

  static Future makeVersionCurrent(
    String documentId,
    int versionNum,
  ) async {
    return HttpService.request(
      '/documents/$documentId/versions',
      method: 'PUT',
      body: {
        'versionNum': versionNum,
      },
    );
  }

  static Future updateDocumentVersion(
    String id,
    int versionNum,
  ) async {
    return makeVersionCurrent(
      id,
      versionNum,
    );
  }
}