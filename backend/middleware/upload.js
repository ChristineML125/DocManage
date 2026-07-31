//multer configuration for handling file uploads
import multer from "multer";
import path from "path";
// fs is file system module in Node.js, used for interacting with the file system
import fs from "fs";
import { fileURLToPath } from "url";

// Find the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Define the root directory for storing uploaded files
const storageRoot = path.join(__dirname, "..", "..", "storage");

// Check if the storage directory exists, if not, create it
if (!fs.existsSync(storageRoot)) {
  fs.mkdirSync(storageRoot, { recursive: true });
}

// Define allowed Mime types for file uploads
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);

// Define the storage configuration for multer, specifying the destination and filename for uploaded files
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, storageRoot), // All uploaded files will be stored in the storageRoot directory
    // Generate a unique filename for each uploaded file using the current timestamp and a random number, while preserving the original file extension
    // This ensures that file names do not overwrite each other and reserve extensions for proper handling
    filename: (_req, _file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(_file.originalname)}`);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // Limit file size to 25MB
    // Define a file filter to allow only specific Mime types for uploads. If the uploaded file's Mime type is not in the allowed list, an error is returned.
    fileFilter: (_req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            cb(new Error("Only PDF, Word, text, excel, and image files are allowed."));
            return;
        }
        cb(null, true);
    }
});

// Profile photos are stored alongside the other application files, but use a
// narrower allow-list and a smaller size limit than document uploads.
export const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!new Set(["image/png", "image/jpeg", "image/webp"]).has(file.mimetype)) {
      cb(new Error("Only PNG, JPEG, and WebP profile photos are allowed."));
      return;
    }
    cb(null, true);
  }
});

