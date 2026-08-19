import { http } from './http.js';

export async function registerPersonal(data) {
    return http('/users/register/personal', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export async function registerCompany(data) {
    return http('/users/register/company', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export async function loginUser(UserName, Password){
    try{
        return http(`/users/login`, {
            method: "POST",
            // JS object convert to JSON when send to backend
            body: JSON.stringify({
                UserName,
                Password
            })
        })
    } catch (err){
        return{
            success: false,
            message: "Unable to connect to server. Please try again."
        };
    }
    
}

export async function getUserList(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/users/list${query ? '?' + query : ''}`;
    return http(url);
}

export async function getUsers(){
    try {
        return http ('/users/count');
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function getUser(id){
    try {
        return http (`/users/${id}`);
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function createUser(user) {
    try{
        return http(`/users`, {
            method: "POST",
            // JS object convert to JSON when send to backend
            body: JSON.stringify(user)
        })
    } catch (err){
        return{
            success: false,
            message: "Unable to connect to server. Please try again."
        };
    }
}

export async function editUser(id, name){
     try{
        return http (`/user/${id}`, {
            method: "PUT",
            body: JSON.stringify({name})
        });

    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function updateUserStatus(id,statusName){
    try {
        return await http(`/users/${id}/status`, {
            method: "PUT",
            body:JSON.stringify({
                status: statusName
            })
        });
    } catch (err) {
        return {
            success:false,
            message:err.message
        };
    }
}

export async function deleteUser(id) {
    try{
        return http (`/user/${id}`, {
            method: "DELETE",
        });
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

export async function resetPassword(id) {
    try {
        return await http(`/users/${id}/reset-password`, {
            method: "POST"
        });

    } catch (err) {
        return {
            success:false,
            message:err.message
        };
    }
}

export async function changePassword(data){

    return http(
        "/users/change-password",
        {
            method:"PUT",
            body:JSON.stringify(data)
        }
    );

}

export async function updateProfile(UserName, Email) {
    return http('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ UserName, Email })
    });
}

export async function sendTemporaryPassword(id) {
    return http(`/users/${id}/send-temp-password`, { method: 'POST' });
}

export async function uploadAvatar(id, file) {
    const formData = new FormData();
    formData.append('avatar', file);
    return http(`/users/${id}/avatar`, { method: 'POST', body: formData });
}

export async function requestPasswordReset(UserName) {
    return http('/users/forgot-password', { method: 'POST', body: JSON.stringify({ UserName }) });
}

export async function getPasswordResetRequests() {
    return http('/users/password-reset-requests');
}
