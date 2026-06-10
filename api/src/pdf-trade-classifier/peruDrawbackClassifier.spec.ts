import {
  classifyPeruDrawbackByKeywords,
  peruDrawbackDefaultRules,
} from './peruDrawbackClassifier';
import { PeruDrawbackDocumentType } from './peruDrawbackTypes';

/** Excerpt shape from Israel 4 `DUA 4.pdf` (Declaración Única de Aduanas). */
const ISRAEL4_DUA_SAMPLE = `
41 - EXPORTACIÓN DEFINITIVA Aduana Código DECLARACION UNICA DE ADUANAS (A) 2
REGISTRO DE ADUANA AEREA Y POSTAL EX- IAAC 235
Nº Orden Destinación Modalidad Tipo Despacho Nº DUA Prov. Nº Declaración: 067181
Fecha Numeración:13/09/2025
1 IDENTIFICACION 1.1 Importador/Exportador HOLY FRUIT PERU S.A.C
peso bruto total peso neto total bultos
`.trim();

describe('classifyPeruDrawbackByKeywords — DAM / DUA', () => {
  it('classifies SUNAT DUA export declaration as CustomsDeclarationDAM, not packing list', () => {
    const result = classifyPeruDrawbackByKeywords(
      ISRAEL4_DUA_SAMPLE,
      peruDrawbackDefaultRules,
      { filePath: 'DUA 4.pdf' },
    );
    expect(result.type).toBe(PeruDrawbackDocumentType.CustomsDeclarationDAM);
    expect(result.matchedKeywords).toEqual(
      expect.arrayContaining(['body:dam-form']),
    );
  });

  it('uses DAM slot for DUA-style filenames when body is sparse', () => {
    const result = classifyPeruDrawbackByKeywords(
      'declaracion unica de aduanas registro de aduana nº dua exportacion definitiva',
      peruDrawbackDefaultRules,
      { filePath: 'DUA 4.pdf' },
    );
    expect(result.type).toBe(PeruDrawbackDocumentType.CustomsDeclarationDAM);
  });
});
