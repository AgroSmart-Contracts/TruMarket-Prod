/**
 * How the API should treat a PDF during upload (classification + storage rules).
 * - normal: milestone / general deal files — no PDF text classification.
 * - payment: trade-doc classifier (commercial invoice, BL, etc.).
 * - drawback: Peru agro-export drawback classifier + validation rules snapshot.
 */
export enum PdfDocumentUploadMode {
  Normal = 'normal',
  Payment = 'payment',
  Drawback = 'drawback',
}
