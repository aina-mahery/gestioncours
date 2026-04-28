import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.resolve("uploads/forum");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  }
});

function fileFilter(req, file, cb) {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Seules les images et les PDF sont autorisés."));
  }
  cb(null, true);
}

export const forumUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});
