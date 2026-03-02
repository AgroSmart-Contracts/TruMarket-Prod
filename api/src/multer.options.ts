import { FileTypeValidator, ParseFilePipe } from '@nestjs/common';
import { type MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';

// Use memory storage in serverless environments (Vercel)
// Files are uploaded to Vercel Blob Storage as Buffers anyway, so memory storage is perfect
const isServerless = process.env.VERCEL;

export const storage = isServerless
  ? memoryStorage() // Memory storage for serverless (files as Buffers)
  : diskStorage({
      // Disk storage for regular environments (local dev, ECS)
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    });

export const fileFilter = (req, file, cb): void => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|pdf|mp4)$/)) {
    cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

export const limits = {
  fileSize: 30 * 1024 * 1024,
};

export const filePipeValidator = new ParseFilePipe({
  validators: [
    new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif|webp|pdf|mp4)' }),
  ],
  fileIsRequired: true,
});

export const multerOptions: MulterOptions = { storage, fileFilter, limits };
