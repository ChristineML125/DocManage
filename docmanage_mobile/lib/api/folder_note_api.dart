import 'http_service.dart';

class FolderNoteApi {
  // =========================================================
  // FOLDERS
  // =========================================================

  static Future getFolders() async {
    return HttpService.request('/folders', method: 'GET');
  }

  static Future createFolder(String folderName, {int? parentFolderID}) async {
    return HttpService.request('/folders', method: 'POST', body: {
      'folderName': folderName,
      if (parentFolderID != null) 'parentFolderID': parentFolderID,
    });
  }

  static Future renameFolder(int folderID, String folderName) async {
    return HttpService.request('/folders/$folderID', method: 'PUT', body: {
      'folderName': folderName,
    });
  }

  static Future deleteFolder(int folderID) async {
    return HttpService.request('/folders/$folderID', method: 'DELETE');
  }

  static Future assignDocument(int documentID, int folderID) async {
    return HttpService.request('/folders/assign', method: 'POST', body: {
      'documentID': documentID,
      'folderID': folderID,
    });
  }

  static Future unassignDocument(int documentID) async {
    return HttpService.request('/folders/unassign', method: 'POST', body: {
      'documentID': documentID,
    });
  }

  // =========================================================
  // NOTES
  // =========================================================

  static Future getNotes(int documentID) async {
    return HttpService.request('/notes/document/$documentID', method: 'GET');
  }

  static Future createNote(int documentID, String? title, String content) async {
    return HttpService.request('/notes', method: 'POST', body: {
      'documentID': documentID,
      'noteTitle': title,
      'noteContent': content,
    });
  }

  static Future updateNote(int noteID, String? title, String content) async {
    return HttpService.request('/notes/$noteID', method: 'PUT', body: {
      'noteTitle': title,
      'noteContent': content,
    });
  }

  static Future deleteNote(int noteID) async {
    return HttpService.request('/notes/$noteID', method: 'DELETE');
  }

  static Future getNoteCounts() async {
    return HttpService.request('/notes/counts', method: 'GET');
  }
}
