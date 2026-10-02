import { http } from './http.js';

export async function getBilling() {
    return http('/billing/usage');
}
