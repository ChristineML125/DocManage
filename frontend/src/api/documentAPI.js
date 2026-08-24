import { http } from './http.js';

export async function getDocumentsList(params={}){
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== ''));

    try {
        const queryString = new URLSearchParams(cleanParams).toString();
        const url = queryString ? `/documents/list?${queryString}` : '/documents/list';
        return await http (url);
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function getDocuments(){
    try {
        return await http ('/documents/count');
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function getDocument(id){
    try {
        
        return await http (`/documents/${id}`);
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function uploadDocument(formData) {
    try{

        return await http ('/documents/upload',{
            method: "POST",
            body: formData
        });

    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function uploadNewVersion(documentID, formData) {
    try{
        return await http(`/documents/${documentID}/version`, {
            method: "POST",
            body: formData
        });
    } catch(err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function deleteDocuments(id) {
    try{
        return await http (`/documents/${id}`, {
            method: "DELETE",
        });
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function renameDocument(id, documentName) {
    try {
        return await http(`/documents/${id}/rename`, {
            method: "PUT",
            body: JSON.stringify({ documentName }),
        });
    } catch (err) {
        return { success: false, message: err.message };
    }
}

export async function exportPDF(documentID, options = {}){
     try{
        return http('/documents/export',{
            method:"POST",
            body:JSON.stringify({
                documentID
            }),
            ...options
        });

    }catch(err){
        return {
            success:false,
            message:err.message
        };

    }
}

export async function exportDocx(documentID, options = {}){
     try{
        return http('/documents/export-docx',{
            method:"POST",
            body:JSON.stringify({
                documentID
            }),
            ...options
        });

    }catch(err){
        return {
            success:false,
            message:err.message
        };

    }
}

export async function exportXlsx(documentID, options = {}){
     try{
        return http('/documents/export-xlsx',{
            method:"POST",
            body:JSON.stringify({
                documentID
            }),
            ...options
        });

    }catch(err){
        return {
            success:false,
            message:err.message
        };

    }
}

export async function updateDocumentStatus(id,statusName){
    try {
        return await http(`/documents/${id}/status`, {
            method: "PUT",
            body:JSON.stringify({
                statusName: statusName
            })
        });
    } catch (err) {
        return {
            success:false,
            message:err.message
        };
    }
}

export async function updateDocumentVersion(id,versionNum){
    try {
        return await http(`/documents/${id}/versions`, {
            method: "PUT",
            body:JSON.stringify({
                versionNum
            })
        });
    } catch (err) {
        return {
            success:false,
            message:err.message
        };
    }
}

export async function getVersionList(documentID){
    try{
        return await http(`/documents/${documentID}/versions`);
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
    
}

export async function aiService(documentID){
    try {
        return await http(`/documents/${documentID}/summary`);
    }catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function generateAISummary(documentID){
    try {
        return await http(`/documents/${documentID}/generate-summary`, {
            method: "POST"
        });
    } catch (err) {
        return {
            success:false,
            message:err.message
        };
    }
}

export async function previewDocument(documentID) {
     console.log("CALL PREVIEW API:", documentID);
     
    try{

        return await http(`/documents/${documentID}/preview`, {
            method: "POST"
        });
    } catch (err) {
        return {
            success:false,
            message:err.message
        };
    }
}

export async function toggleFavorite(documentID) {
    try {
        return await http(`/documents/${documentID}/favorite`, {
            method: "POST"
        });
    } catch (err) {
        return { success: false, message: err.message };
    }
}

export async function getFavorites() {
    try {
        return await http('/documents/favorites');
    } catch (err) {
        return { success: false, message: err.message };
    }
}

export async function isFavorite(documentID) {
    try {
        return await http(`/documents/${documentID}/is-favorite`);
    } catch (err) {
        return { success: false, message: err.message };
    }
}