import {
  type ClassificationRule,
  type ClassifiedDocumentType,
  DOCUMENT_TYPES,
  DocumentType,
} from './types';

export const defaultRules: ClassificationRule[] = [
  {
    type: DocumentType.PhytosanitaryCertificate,
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
    type: DocumentType.CertificateOfOrigin,
    keywords: [
      'certificate of origin',
      'certificado de origen',
      'certificado de origem',
      'country of origin',
      'camara de comercio',
      'camara de comercio e industria',
      'camara de comercio y produccion',
      'eur.1',
      'eur1',
      'movement certificate',
      'certificado eur',
      'reglamento de la ue',
    ],
  },
  {
    type: DocumentType.PackingList,
    keywords: [
      'packing list',
      'lista de empaque',
      'lista de embalaje',
      'romaneio',
      'conteo de bultos',
      'total cartons',
      'gross weight',
      'net weight',
    ],
  },
  {
    type: DocumentType.BillOfLadingOrAwb,
    keywords: [
      'bill of lading',
      'sea waybill',
      'waybill non-negotiable',
      'conocimiento de embarque',
      'conhecimento de embarque',
      'awb',
      'air waybill',
      'master airway bill',
      'house airway bill',
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
    type: DocumentType.CommercialInvoice,
    keywords: [
      'commercial invoice',
      'factura comercial',
      'fatura comercial',
      'factura electronica',
      'fatura eletronica',
      'nota fiscal',
      'invoice no',
      'numero de factura',
      'numero da fatura',
      'seller',
      'buyer',
    ],
  },
];

type ClassificationOptions = {
  filePath?: string;
};

const highPriorityRules: ClassificationRule[] = [
  {
    type: DocumentType.PhytosanitaryCertificate,
    keywords: [
      'phytosanitary certificate',
      'certificado fitosanitario',
      'certificado fitossanitario',
    ],
  },
  {
    type: DocumentType.CertificateOfOrigin,
    keywords: [
      'certificate of origin',
      'certificado de origen',
      'certificado de origem',
      'eur.1',
      'eur1',
      'movement certificate',
      'reglamento de la ue',
    ],
  },
  {
    type: DocumentType.PackingList,
    keywords: [
      'packing list',
      'lista de empaque',
      'lista de embalaje',
      'romaneio',
    ],
  },
];

const filenameHints: Record<DocumentType, string[]> = {
  [DocumentType.CommercialInvoice]: ['invoice', 'factura', 'fatura', 'e001'],
  [DocumentType.BillOfLadingOrAwb]: [
    'bl',
    'bld',
    'awb',
    'airwaybill',
    'waybill',
    'mbl',
    'seawaybill',
    'seawb',
  ],
  [DocumentType.CertificateOfOrigin]: [
    'certificateoforigin',
    'certificadoorigen',
    'certificadodeorigem',
    'certificadoeur',
    'certificadoaur',
    'eur1',
    'co',
  ],
  [DocumentType.PackingList]: [
    'packinglist',
    'packlist',
    'listaempaque',
    'listaembalaje',
  ],
  [DocumentType.PhytosanitaryCertificate]: [
    'phyto',
    'phito',
    'fito',
    'fitosanitario',
    'fitossanitario',
  ],
};

export function classifyByKeywords(
  text: string,
  rules: ClassificationRule[] = defaultRules,
  options?: ClassificationOptions,
): {
  type: ClassifiedDocumentType;
  score: number;
  matchedKeywords: string[];
} {
  const normalized = text.toLowerCase();
  const rawFilePath = options?.filePath ?? '';
  const fileNameOnly = rawFilePath.split(/[\\/]/).pop() ?? '';
  const compactFileName = fileNameOnly.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const rule of highPriorityRules) {
    const matches = rule.keywords.filter((keyword) =>
      normalized.includes(keyword.toLowerCase()),
    );
    if (matches.length > 0) {
      return {
        type: rule.type,
        score: matches.length,
        matchedKeywords: matches,
      };
    }
  }

  let bestType: ClassifiedDocumentType = 'Unknown';
  let bestScore = 0;
  let bestMatches: string[] = [];

  for (const rule of rules) {
    const matches = rule.keywords.filter((keyword) =>
      normalized.includes(keyword.toLowerCase()),
    );
    if (matches.length > bestScore) {
      bestType = rule.type;
      bestScore = matches.length;
      bestMatches = matches;
    }
  }

  if (bestScore === 0 && compactFileName.length > 0) {
    for (const [type, hints] of Object.entries(filenameHints) as Array<
      [DocumentType, string[]]
    >) {
      const hintMatches = hints.filter((hint) =>
        compactFileName.includes(hint),
      );
      if (hintMatches.length > 0) {
        return {
          type,
          score: hintMatches.length,
          matchedKeywords: hintMatches.map((value) => `filename:${value}`),
        };
      }
    }
  }

  return { type: bestType, score: bestScore, matchedKeywords: bestMatches };
}

export function listSupportedTypes(): readonly DocumentType[] {
  return DOCUMENT_TYPES;
}
