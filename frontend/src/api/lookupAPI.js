import { http } from './http.js';

export async function getAllLookUp(){
    return http('/lookup/all');
};

