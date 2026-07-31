import { http } from './http.js';

export async function getAuditLogs(){
    try {
        const data = await http('/auditlogs');
        return data;
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}