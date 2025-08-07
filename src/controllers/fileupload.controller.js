const multer = require("multer");
const { uploadToSupabase } = require("../helper/supabase");

// Use multer memory storage (in-memory buffer)
const upload = multer({ storage: multer.memoryStorage() });
const { sanitizeFileName } = require("../helper/santize")

/**
 * Upload a single file to Supabase
 */
const uploadFileSingle = async (req, res) => {
    try {
        const { uploadDir, subDir } = req.query
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file provided." });
        }

        const { originalname, buffer, mimetype } = req.file;
        const userId = req.user?.id || Date.now();
        const result = await uploadToSupabase({
            file: buffer,
            folder: `${uploadDir}-${userId}/${subDir}`,
            filename: `${Date.now()}_${sanitizeFileName(originalname)}`,
            contentType: mimetype,
        });

        return res.status(200).json({
            success: true,
            url: result.publicUrl,
            path: result.path,
        });
    } catch (err) {
        console.error("Upload error:", err);
        return res.status(500).json({ success: false, error: err.message || "Upload failed" });
    }
};

/**
 * Upload multiple files to Supabase
 */
const uploadFileMultiple = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: "No files provided." });
        }
        const userId = req.user?.id || "anonymous";
        const uploads = await Promise.all(req.files.map(file =>
            uploadToSupabase({
                file: file.buffer,
                folder: `user${userId}/avatar`,
                filename: `${Date.now()}_${sanitizeFileName(file.originalname)}`,
                contentType: file.mimetype,
            })
        ));

        return res.status(200).json({
            success: true,
            files: uploads.map(result => ({
                url: result.publicUrl,
                path: result.path,
            })),
        });
    } catch (err) {
        console.error("Upload error:", err);
        return res.status(500).json({ success: false, error: err.message || "Upload failed" });
    }
};

// Exports
module.exports = {
    uploadFileSingle,
    uploadFileMultiple,
    uploadSingle: upload.single("file"),      // expected form-data key: "file"
    uploadMultiple: upload.array("files"),    // expected form-data key: "files"
};
