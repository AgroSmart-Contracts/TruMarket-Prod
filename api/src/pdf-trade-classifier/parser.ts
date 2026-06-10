import fs from 'node:fs/promises';
import { basename } from 'node:path';

import type { ParsedPdfResult } from './types';

/** pdf-parse@1.1.1 is CJS (module.exports = fn). Use require() so tsc does not emit `.default`. */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse') as (
  data: Buffer,
) => Promise<{ text: string; numpages: number }>;

/** pdf-parse v1 — no @napi-rs/canvas (required by pdf-parse v2, breaks on Vercel). */
export async function parsePdf(filePath: string): Promise<ParsedPdfResult> {
  const buffer = await fs.readFile(filePath);
  return parsePdfBuffer(buffer, filePath);
}

export async function parsePdfBuffer(
  buffer: Uint8Array,
  filePath = 'uploaded-file.pdf',
): Promise<ParsedPdfResult> {
  const data = await pdfParse(Buffer.from(buffer));
  const text = normalizeText(data.text ?? '');

  return {
    filePath,
    text,
    textPreview: text.slice(0, 500),
    metadata: {
      fileName: basename(filePath),
      pages: data.numpages,
    },
  };
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}
