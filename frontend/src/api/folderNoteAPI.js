import { http } from './http.js';

// Folder API
export async function getFolders() {
  return http('/folders');
}

export async function createFolder(folderName, parentFolderID = null) {
  return http('/folders', { method: 'POST', body: { folderName, parentFolderID } });
}

export async function renameFolder(folderID, folderName) {
  return http(`/folders/${folderID}`, { method: 'PUT', body: { folderName } });
}

export async function deleteFolder(folderID) {
  return http(`/folders/${folderID}`, { method: 'DELETE' });
}

export async function assignDocumentToFolder(documentID, folderID) {
  return http('/folders/assign', { method: 'POST', body: { documentID, folderID } });
}

export async function unassignDocumentFromFolder(documentID) {
  return http('/folders/unassign', { method: 'POST', body: { documentID } });
}

// Note API
export async function getNotes(documentID) {
  return http(`/notes/document/${documentID}`);
}

export async function createNote(documentID, noteTitle, noteContent) {
  return http('/notes', { method: 'POST', body: { documentID, noteTitle, noteContent } });
}

export async function updateNote(noteID, noteTitle, noteContent) {
  return http(`/notes/${noteID}`, { method: 'PUT', body: { noteTitle, noteContent } });
}

export async function deleteNote(noteID) {
  return http(`/notes/${noteID}`, { method: 'DELETE' });
}

export async function getNoteCounts() {
  return http('/notes/counts');
}
