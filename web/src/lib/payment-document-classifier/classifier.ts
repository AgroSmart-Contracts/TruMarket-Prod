import {
    FrontendDocumentType,
    type FrontendClassifiedDocumentType,
    type FrontendClassificationResult,
} from './types';

type ClassificationRule = {
    type: FrontendDocumentType;
    keywords: string[];
};

const rules: ClassificationRule[] = [
    {
        type: FrontendDocumentType.PhytosanitaryCertificate,
        keywords: [
            'phytosanitary certificate',
            'certificado fitosanitario',
            'certificado fitossanitario',
            'fitosanitario',
            'fitossanitario',
            'plant protection',
        ],
    },
    {
        type: FrontendDocumentType.CertificateOfOrigin,
        keywords: [
            'certificate of origin',
            'certificado de origen',
            'certificado de origem',
            'country of origin',
            'camara de comercio',
        ],
    },
    {
        type: FrontendDocumentType.PackingList,
        keywords: [
            'packing list',
            'lista de empaque',
            'lista de embalaje',
            'romaneio',
            'gross weight',
            'net weight',
        ],
    },
    {
        type: FrontendDocumentType.BillOfLadingOrAwb,
        keywords: [
            'bill of lading',
            'conocimiento de embarque',
            'conhecimento de embarque',
            'awb',
            'air waybill',
            'port of loading',
            'port of discharge',
            'airport of departure',
            'airport of destination',
            'vessel',
            'voyage',
            'transit',
        ],
    },
    {
        type: FrontendDocumentType.CommercialInvoice,
        keywords: [
            'commercial invoice',
            'factura comercial',
            'fatura comercial',
            'factura electronica',
            'fatura eletronica',
            'nota fiscal',
            'invoice',
            'seller',
            'buyer',
        ],
    },
];

const fileNameHints: Record<FrontendDocumentType, string[]> = {
    [FrontendDocumentType.CommercialInvoice]: ['invoice', 'factura', 'fatura', 'e001'],
    [FrontendDocumentType.BillOfLadingOrAwb]: ['bl', 'bld', 'awb', 'airwaybill', 'waybill'],
    [FrontendDocumentType.CertificateOfOrigin]: ['certificateoforigin', 'certificadoorigen', 'certificadodeorigem', 'co'],
    [FrontendDocumentType.PackingList]: ['packinglist', 'packlist', 'listaempaque', 'listaembalaje', 'pl'],
    [FrontendDocumentType.PhytosanitaryCertificate]: [
        'phyto',
        'phito',
        'fito',
        'fitosanitario',
        'fitossanitario',
    ],
};

export function classifyDocumentText(text: string, fileName?: string): FrontendClassificationResult {
    const normalized = text.toLowerCase();
    const compactFileName = (fileName ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

    let bestType: FrontendClassifiedDocumentType = 'Unknown';
    let bestScore = 0;
    let bestMatches: string[] = [];

    for (const rule of rules) {
        const matches = rule.keywords.filter((keyword) => normalized.includes(keyword));
        if (matches.length > bestScore) {
            bestType = rule.type;
            bestScore = matches.length;
            bestMatches = matches;
        }
    }

    if (bestScore === 0 && compactFileName) {
        for (const [type, hints] of Object.entries(fileNameHints) as Array<[FrontendDocumentType, string[]]>) {
            const matches = hints.filter((hint) => compactFileName.includes(hint));
            if (matches.length > 0) {
                return {
                    type,
                    score: matches.length,
                    matchedKeywords: matches.map((match) => `filename:${match}`),
                };
            }
        }
    }

    return {
        type: bestType,
        score: bestScore,
        matchedKeywords: bestMatches,
    };
}

