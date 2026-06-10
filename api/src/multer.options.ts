import { FileValidator, ParseFilePipe } from '@nestjs/common';
import { type MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

// Keep upload behavior identical across local and production.
// Vercel Blob upload path consumes file buffers, so memory storage is suitable.
export const storage = memoryStorage();

const allowedMimeTypeRegex =
  /^(image\/(jpeg|png|gif|webp)|application\/pdf|video\/mp4)$/i;

class MimeTypeFileValidator extends FileValidator<{
  mimeTypeRegex: RegExp;
}> {
  buildErrorMessage(file: Express.Multer.File): string {
    return `Validation failed (current file type is ${file?.mimetype || 'unknown'}, expected allowed mime type)`;
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file?.mimetype) {
      return false;
    }

    return this.validationOptions.mimeTypeRegex.test(file.mimetype);
  }
}

export const fileFilter = (req, file, cb): void => {
  const originalname = file?.originalname ?? '';
  const isPdfByName = originalname.toLowerCase().endsWith('.pdf');
  const mime = file?.mimetype ?? '';

  // Some browsers send PDFs as application/octet-stream; accept when extension is .pdf.
  if (isPdfByName && (!mime || mime === 'application/octet-stream')) {
    file.mimetype = 'application/pdf';
  }

  // Temporary upload diagnostics.
  console.info('[upload:fileFilter]', {
    mimetype: file?.mimetype,
    originalname: file?.originalname,
    size: file?.size,
    hasBuffer: Boolean(file?.buffer),
    bufferLength: file?.buffer?.length ?? null,
  });

  if (!allowedMimeTypeRegex.test(file.mimetype)) {
    cb(
      new Error(
        'Only jpg, jpeg, png, gif, webp, pdf, and mp4 files are allowed!',
      ),
      false,
    );
    return;
  }
  cb(null, true);
};

export const limits = {
  fileSize: 30 * 1024 * 1024,
};

export const filePipeValidator = new ParseFilePipe({
  validators: [
    new MimeTypeFileValidator({ mimeTypeRegex: allowedMimeTypeRegex }),
  ],
  fileIsRequired: true,
});

export const multerOptions: MulterOptions = { storage, fileFilter, limits };
