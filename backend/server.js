//cors allow fronted access
import cors from 'cors';
// dotenv for reading environment variables from .env file
import dotenv from 'dotenv';
//express backend framework for building APIs
import express from 'express';
// path module for working with file and directory paths
import path from 'path';
import { fileURLToPath } from 'url';
//importing routers for handling document and lookup related API endpoints
import documentRoutes from './routes/documentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import lookupRoutes from './routes/lookupRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import auditLogsRoutes from './routes/auditLogsRoutes.js';
import { authenticate } from './middleware/auth.js';
import { isConfigured as supabaseConfigured, getPublicUrl, getSupabase } from './config/storage.js';

dotenv.config();

const app = express();
// fix dirname (ES module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    credentials: true,
    origin(origin, callback) {
        // Native mobile requests do not send an Origin header.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origin is not allowed by CORS'));
    }
}));
app.use(express.json());
// Serve uploaded files
if (supabaseConfigured()) {
    console.log("Using Supabase Storage for files");
    app.use("/files", async (req, res) => {
        const filename = req.path.replace(/^\//, '');
        if (!filename || filename === 'password-reset-requests.json') {
            return res.status(404).end();
        }
        try {
            const client = getSupabase();
            const { data, error } = await client.storage
                .from(process.env.SUPABASE_BUCKET || 'documents')
                .download(filename);
            if (error || !data) {
                return res.status(404).json({ error: "File not found" });
            }
            const buffer = Buffer.from(await data.arrayBuffer());
            const ext = filename.split('.').pop().toLowerCase();
            const mimeTypes = {
                pdf: 'application/pdf',
                docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                doc: 'application/msword',
                xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                xls: 'application/vnd.ms-excel',
                txt: 'text/plain',
                png: 'image/png',
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                webp: 'image/webp',
            };
            const disposition = req.query.download === '1' ? 'attachment' : 'inline';
            const downloadName = req.query.name || filename;
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Content-Length', buffer.length);
            res.setHeader('Content-Disposition', `${disposition}; filename="${downloadName}"`);
            res.send(buffer);
        } catch (err) {
            console.error("File proxy error:", err);
            res.status(500).json({ error: "Failed to fetch file" });
        }
    });
} else {
    console.log("Using local storage for files");
    const storagePath = path.join(process.cwd(), "..", "storage");
    console.log("Storage folder:", storagePath);
    app.use("/files/password-reset-requests.json", (_req, res) => {
        res.status(404).end();
    });
    app.use("/files", authenticate, express.static(storagePath));
    app.use("/files", (_req, res) => res.status(404).json({ error: "File not found" }));
}

app.use("/api/documents", documentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lookup", lookupRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/auditlogs", auditLogsRoutes)

// Return upload and API errors as JSON so the frontend can display the actual
// reason instead of treating them as a generic network failure.
app.use((err, _req, res, _next) => {
    console.error('API error:', err);
    res.status(err.status || 400).json({ success: false, message: err.message || 'Request failed.' });
});

// Serve frontend build
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));
// SPA fallback: serve index.html for all non-API, non-file routes
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

const PORT = process.env.PORT || 3000;
// server start
try{
    app.listen(PORT, "0.0.0.0", ()=>{
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    }).on('error', (err)=>{
        console.error('Server listen error:', err);
    });
} catch (err) {
    console.error('Failed to start server:', err)
}
