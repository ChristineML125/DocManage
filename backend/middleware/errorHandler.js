export function errorHandler(err, req, res, next) {
    console.log("Error:", err);

    if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors (e.g., file size limit, invalid file type)
        res.status(400).json({ message: err.message });
    } else if (err.code === "INVALID_FILE_TYPE") {
        // Handle custom file type validation errors
        res.status(400).json({ message: err.message });
    } else {
        // Handle other types of errors (e.g., database errors, unexpected issues)
        res.status(500).json({ message: "An unexpected error occurred." });
    }
}