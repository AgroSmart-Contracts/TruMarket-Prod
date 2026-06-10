/**
 * Optional Pdf-marker integration hook (not required for text extraction).
 * Parsing uses pdf-parse via parser.ts.
 */
export async function loadPdfMarkerInfo(): Promise<{
  loaded: boolean;
  exportKeys: string[];
  note: string;
}> {
  return {
    loaded: false,
    exportKeys: [],
    note: 'Pdf-marker adapter disabled; pdf-parse is used for extraction.',
  };
}
