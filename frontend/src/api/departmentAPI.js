import { http } from './http.js';

export async function getDepartmentLoad(){
    try {
        const data = await http ('/departments/load');
        return data;
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function getDepartment(id){
    try {
        const data = await http (`/departments/${id}`, 
        {
            method: "Get",
        });
        return data;
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function createDepartment(name){
    if(typeof name !== 'string' || name.trim() === ''){
        return {
            success: false,
            message: 'Department name must be a non-empty string'
        };
    }
    try{
        const data = await http (`/departments`, {
            method: "POST",
            body: JSON.stringify({name})
        });
        return data;
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function updateDepartment(id, name){
    if(typeof name !== 'string' || name.trim() === ''){
        return {
            success: false,
            message: 'Department name must be a non-empty string'
        };
    }
     try{
        const data = await http (`/departments/${id}`, {
            method: "PUT",
            body: JSON.stringify({name})
        });
        return data;
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function deleteDepartment(id) {
    try{
        const data = await http (`/departments/${id}`, {
            method: "DELETE",
        });
        return data;
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}