import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ResumeVersion from '../models/ResumeVersion';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || './uploads/resumes';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
});

export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const resume = await ResumeVersion.create({
      userId: req.user._id,
      name: req.body.name || req.file.originalname,
      fileUrl: `/uploads/resumes/${req.file.filename}`,
    });

    res.status(201).json({ success: true, resume });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getResumes = async (req: AuthRequest, res: Response) => {
  try {
    const resumes = await ResumeVersion.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, resumes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteResume = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const resume = await ResumeVersion.findOne({ _id: id, userId: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const filePath = path.join(process.cwd(), resume.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await ResumeVersion.findByIdAndDelete(id);
    res.json({ success: true, message: 'Resume deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

