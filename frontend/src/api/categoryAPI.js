import { http } from './http.js';

export async function getCategories(){
    try {
        const data = await http('/categories');
        return data;
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function getCategory(id){
    try {
        const data = await http (`/categories/${id}`, 
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

export async function createCategory(payload){
    const { name, description = '' } = typeof payload === 'string'
        ? { name: payload, description: '' }
        : (payload || {});

    if(typeof name !== 'string' || name.trim() === ''){
        return {
            success: false,
            message: "Invalid category name"
        };
    }
    try{
        const data = await http (`/categories`, {
            method: "POST",
            body: JSON.stringify({ name, description })
        });
        return data;
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export const createCategories = createCategory;

export async function updateCategory(id, name, description = ''){
    if(typeof name !== 'string' || name.trim() === ''){
        return {
            success: false,
            message: "Invalid category name"
        };
    }
    try{
        const data = await http (`/categories/${id}`, {
            method: "PUT",
            body: JSON.stringify({name, description})
        });
        return data;
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function deleteCategory(id) {
    try{
        const data = await http (`/categories/${id}`, {
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
