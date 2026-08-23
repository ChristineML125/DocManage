const BASE_URL = [
    import.meta.env.VITE_API_URL_PRIMARY,
    import.meta.env.VITE_API_URL_BACKUP,
    import.meta.env.VITE_API_URL
].filter(Boolean);

// If no env var is set, use same-origin (when frontend is served from backend)
if (BASE_URL.length === 0) {
    BASE_URL.push('/api');
}

console.log("BASE_URL =", BASE_URL);

// Build a full file URL (/files/...) from the configured API base.
// Accepts either a bare filename, "files/...", "/files/...", or an already
// absolute http(s) URL (returned unchanged).
export function getFileUrl(filePath) {
    if (!filePath) return "";
    const clean = String(filePath).trim();
    if (/^https?:\/\//i.test(clean)) return clean;
    const filePathWithoutPrefix = clean.replace(/^\/?files\//i, "");
    const base = (BASE_URL[0] || "").replace(/\/api\/?$/i, "");
    return `${base}/files/${filePathWithoutPrefix}`;
}

// Fetch a file from the protected /files route with the Bearer token attached.
// Accepts a full URL or a bare path; tries each configured base as fallback.
export async function fetchFile(filePathOrUrl) {
    const token = sessionStorage.getItem("token");
    let lastError;

    for (const baseURL of BASE_URL) {
        try {
            const url = /^https?:\/\//i.test(filePathOrUrl)
                ? filePathOrUrl
                : getFileUrl(filePathOrUrl);

            const res = await fetch(url, {
                credentials: "include",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            return res;
        } catch (error) {
            console.error(`File fetch failed: ${baseURL}`, error);
            lastError = error;
        }
    }

    throw lastError || new Error("Unable to fetch file");
}

export async function http(url, options = {}) {
    let lastError;

    for (const baseURL of BASE_URL) {
        try {
            const token = sessionStorage.getItem("token");

            const isFormData = options.body instanceof FormData;

            const fetchOptions = {
                ...options,
                credentials: "include",
                headers: {
                    ...(isFormData
                        ? {}
                        : { "Content-Type": "application/json" }),

                    ...(token && {
                        Authorization: `Bearer ${token}`
                    }),

                    ...options.headers
                }
            };

            if (
                fetchOptions.body &&
                !isFormData &&
                typeof fetchOptions.body !== "string"
            ) {
                fetchOptions.body = JSON.stringify(fetchOptions.body);
            }

            if (!fetchOptions.method) {
                fetchOptions.method = fetchOptions.body ? "POST" : "GET";
            }

            console.log(
                `${fetchOptions.method} ${baseURL}${url}`
            );

            const res = await fetch(
                `${baseURL}${url}`,
                fetchOptions
            );

            if (!res.ok) {
                const error = await res
                    .json()
                    .catch(() => ({
                        message: res.statusText
                    }));

                throw new Error(
                    error.message || `HTTP ${res.status}`
                );
            }

            return await res.json();

        } catch (error) {
            console.error(
                `Request failed: ${baseURL}${url}`,
                error
            );

            lastError = error;
        }
    }

    throw lastError || new Error("Unable to connect to server");
}
