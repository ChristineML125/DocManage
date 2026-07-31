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

dotenv.config();

const app = express();
// fix dirname (ES module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
// Serve static files from the frontend build directory
const storagePath = path.join(process.cwd(), "..", "storage");
console.log("Storage folder:", storagePath);
app.use("/files", express.static(storagePath));

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

// test route
app.get("/", (req,res)=>{
    res.send("Backend is running");
});
// empty route for remove warning
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req,res)=>{
    res.json({});
});

const PORT = process.env.PORT || 3000;
// server start
try{
    app.listen(PORT, ()=>{
        console.log(`Server running on http://localhost:${PORT}`);
    }).on('error', (err)=>{
        console.error('Server listen error:', err);
    });
} catch (err) {
    console.error('Failed to start server:', err)
}
