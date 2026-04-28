import multer from "multer";

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "text/csv",
    "application/vnd.ms-excel"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Type de fichier non autorisé."));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});
