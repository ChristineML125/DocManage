
const BASE_URL = import.meta.env.VITE_API_URL;

export async function http(url, options = {}) {

    const token = sessionStorage.getItem("token");

    const isFormData = options.body instanceof FormData;

    const fetchOptions = ({
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(token && {
                Authorization: `Bearer ${token}`
            }),
            ...options.headers
        },
        ...options
    });

    if(fetchOptions.body && !isFormData && typeof fetchOptions.body !== 'string'){
        fetchOptions.body = JSON.stringify(fetchOptions.body);
    }
    
    if(!fetchOptions.method){
        fetchOptions.method = fetchOptions.body ? 'POST' : 'GET';
    }

    const res = await fetch(`${BASE_URL}${url}`, fetchOptions);
    
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || `HTTP ${res.status}`);
    }
    return res.json();
}
