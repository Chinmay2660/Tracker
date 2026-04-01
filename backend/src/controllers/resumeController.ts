import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ResumeVersion from '../models/ResumeVersion';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// For Vercel serverless, use /tmp directory (only writable location)
const uploadDir = process.env.VERCEL === '1' 
  ? '/tmp/uploads/resumes'
  : (process.env.UPLOAD_DIR || './uploads/resumes');

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
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

function getResumeAbsolutePath(fileUrl: string): string {
  const relative = fileUrl.replace(/^\//, '');
  if (process.env.VERCEL === '1') {
    return path.join('/tmp', relative);
  }
  return path.join(process.cwd(), relative);
}

/** Stream file for owner — works on serverless where /uploads static is not mounted. */
export const downloadResumeFile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const resume = await ResumeVersion.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const absolutePath = getResumeAbsolutePath(resume.fileUrl);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    const ext = path.extname(resume.fileUrl).toLowerCase();
    const mimeByExt: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    const contentType = mimeByExt[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(resume.name || 'resume')}"`
    );
    return res.sendFile(path.resolve(absolutePath));
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

    const filePath = getResumeAbsolutePath(resume.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await ResumeVersion.findByIdAndDelete(id);
    res.json({ success: true, message: 'Resume deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

