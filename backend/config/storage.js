import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'documents';

let supabase = null;

export function getSupabase() {
    if (!supabase && SUPABASE_URL && SUPABASE_KEY) {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return supabase;
}

export async function uploadFile(buffer, filename, contentType) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase not configured');

    const { error } = await client.storage
        .from(BUCKET_NAME)
        .upload(filename, buffer, {
            contentType,
            upsert: true
        });

    if (error) throw error;
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
}

export async function deleteFile(filename) {
    const client = getSupabase();
    if (!client) return;

    await client.storage
        .from(BUCKET_NAME)
        .remove([filename]);
}

export function getPublicUrl(filename) {
    if (!SUPABASE_URL) return `/files/${filename}`;
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
}

export function isConfigured() {
    return !!(SUPABASE_URL && SUPABASE_KEY);
}
