//multer configuration for handling file uploads
import multer from "multer";
import path from "path";

// Define allowed Mime types for file uploads
const allowedMimeTypes = new Set([
  "application/pdf",

  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "text/plain",

  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/heic",
  "image/heif",

  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);

const allowedExtensions = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".heic",
  ".heif",
  ".xls",
  ".xlsx",
]);

function generateFilename(file) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname).toLowerCase();
    return `${unique}${extension}`;
}

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
    const mimeType = (file.mimetype || "").toLowerCase();
    const extension = path.extname(file.originalname).toLowerCase();

    console.log("========== MULTER UPLOAD ==========");
    console.log("Original filename:", file.originalname);
    console.log("MIME type:", mimeType);
    console.log("Extension:", extension);
    console.log("===================================");

    if (allowedMimeTypes.has(mimeType)) {
      cb(null, true);
      return;
    }

    if (allowedExtensions.has(extension)) {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        "Only PDF, Word, text, excel, and image files are allowed."
      )
    );
  },
});

export function generateUniqueFilename(originalname) {
    const ext = path.extname(originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return `${unique}${ext}`;
}

const allowedAvatarMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const allowedAvatarExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
]);

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const mimeType = (file.mimetype || "").toLowerCase();
    const extension = path.extname(file.originalname).toLowerCase();

    console.log("========== AVATAR UPLOAD ==========");
    console.log("Original filename:", file.originalname);
    console.log("MIME type:", mimeType);
    console.log("Extension:", extension);
    console.log("===================================");

    if (allowedAvatarMimeTypes.has(mimeType)) {
      cb(null, true);
      return;
    }

    if (allowedAvatarExtensions.has(extension)) {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        "Only PNG, JPEG, and WebP profile photos are allowed."
      )
    );
  },
});

