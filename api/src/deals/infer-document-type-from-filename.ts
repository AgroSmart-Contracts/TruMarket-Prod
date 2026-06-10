/** Filename hints aligned with pdf-doc-classifier when PDF text is sparse. */
export function inferDocumentTypeFromFileName(
  fileName: string,
): string | undefined {
  const compact = fileName.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (
    compact.includes('e001') ||
    compact.includes('invoice') ||
    compact.includes('factura') ||
    compact.includes('fatura')
  ) {
    return 'Commercial Invoice';
  }
  if (
    compact.includes('packinglist') ||
    compact.includes('packlist') ||
    /pl\d|^\d+pl|_pl|pl_/.test(compact)
  ) {
    return 'Packing List';
  }
  if (
    compact.includes('phito') ||
    compact.includes('phyto') ||
    compact.includes('fito') ||
    compact.includes('fitosanitario')
  ) {
    return 'Phytosanitary Certificate';
  }
  if (
    compact.includes('certificateoforigin') ||
    compact.includes('certificadoorigen') ||
    /(^|\d)co(\d|$)/.test(compact) ||
    compact.endsWith('co')
  ) {
    return 'Certificate of Origin';
  }
  if (
    compact.includes('bld') ||
    compact.includes('billoflading') ||
    compact.includes('awb') ||
    compact.includes('airwaybill') ||
    /bl[a-z]/.test(compact)
  ) {
    return 'Bill of Lading or AWB';
  }

  return undefined;
}

export function resolveTradeDocumentLabel(
  fileName: string,
  tradePdfClassification?: { detectedType?: string } | null,
  storedDescription?: string,
): string {
  const detected = tradePdfClassification?.detectedType;
  if (detected && detected !== 'Unknown') {
    return detected;
  }
  const fromName = inferDocumentTypeFromFileName(fileName);
  if (fromName) {
    return fromName;
  }
  const desc = storedDescription?.trim();
  if (desc && desc.length < 80 && !desc.toLowerCase().endsWith('.pdf')) {
    return desc;
  }
  return 'Trade document';
}
