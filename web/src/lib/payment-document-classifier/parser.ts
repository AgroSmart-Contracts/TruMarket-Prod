/**
 * Frontend-safe lightweight PDF text extraction.
 * This intentionally avoids extra dependencies and extracts readable strings
 * from raw PDF bytes as a heuristic pre-upload validation step.
 */
export async function extractPdfTextFromFile(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let text = '';
    for (let i = 0; i < bytes.length; i += 1) {
        const value = bytes[i];
        text += value >= 32 && value <= 126 ? String.fromCharCode(value) : ' ';
    }

    return text
        .replace(/\\[rn]/g, ' ')
        .replace(/[()<>[\]{}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

