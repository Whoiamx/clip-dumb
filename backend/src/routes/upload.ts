import { Router } from "express";
import multer from "multer";
import path from "path";
import { nanoid } from "nanoid";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${nanoid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

export const uploadRouter = Router();

uploadRouter.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  res.json({
    url: `/uploads/${req.file.filename}`,
    fileName: req.file.originalname,
    size: req.file.size,
  });
});
