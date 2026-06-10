import {
  evaluateDrawbackChronology,
  inferDrawbackProcessRole,
} from './drawback-chronology-validation';

describe('drawback chronology (field → packing → export sale)', () => {
  it('maps classifier types to chronology roles (content only)', () => {
    expect(
      inferDrawbackProcessRole(
        'Factura venta MP 3.pdf',
        'Peru Drawback: Raw Material Purchase Invoice',
      ),
    ).toBe('purchase');
    expect(
      inferDrawbackProcessRole(
        'GUIA DE REMISION COMPRA FRUTA-09-EG07-111.pdf',
        'Peru Drawback: Raw Material Transport Guide (GRE to plant)',
      ),
    ).toBe('rawMaterialTransport');
    expect(
      inferDrawbackProcessRole(
        'Factura de venta Israel 1.pdf',
        'Peru Drawback: Commercial Export Invoice',
      ),
    ).toBe('export');
  });

  it('does not let COMPRA FRUTA filenames override transport classification', () => {
    expect(
      inferDrawbackProcessRole(
        'GUIA DE REMISION COMPRA FRUTA-09-EG07-111.pdf',
        'Peru Drawback: Raw Material Transport Guide (GRE to plant)',
      ),
    ).toBe('rawMaterialTransport');
  });

  it('excludes DAM and export GRE from export-sale ordering', () => {
    expect(
      inferDrawbackProcessRole(
        'DAM-056607.pdf',
        'Peru Drawback: Customs Declaration (DAM/DUA/SAD)',
      ),
    ).toBeNull();
    expect(
      inferDrawbackProcessRole(
        'Guia de remision exportacion.pdf',
        'Peru Drawback: Export Transport Document (GRE)',
      ),
    ).toBeNull();
  });

  it('accepts Israel 1–style field → maquila → export sale dates', () => {
    const docs = [
      {
        fileName: 'Factura venta MP 3.pdf',
        role: 'purchase' as const,
        dateIso: '2025-07-23',
        detectedType: 'Peru Drawback: Raw Material Purchase Invoice',
      },
      {
        fileName: 'Factura venta MP 4.pdf',
        role: 'purchase' as const,
        dateIso: '2025-07-30',
        detectedType: 'Peru Drawback: Raw Material Purchase Invoice',
      },
      {
        fileName: 'Guia de remision 3.pdf',
        role: 'rawMaterialTransport' as const,
        dateIso: '2025-07-24',
        detectedType:
          'Peru Drawback: Raw Material Transport Guide (GRE to plant)',
      },
      {
        fileName: 'Factura de Maquila 1.pdf',
        role: 'packaging' as const,
        dateIso: '2025-08-10',
        detectedType: 'Peru Drawback: Processing or Maquila Invoice',
      },
      {
        fileName: 'Factura de venta Israel 1.pdf',
        role: 'export' as const,
        dateIso: '2025-08-11',
        detectedType: 'Peru Drawback: Commercial Export Invoice',
      },
    ];
    const result = evaluateDrawbackChronology(docs);
    expect(result.rejected).toBe(false);
    expect(result.codes).toEqual([]);
  });

  it('rejects commercial export invoice before maquila', () => {
    const result = evaluateDrawbackChronology([
      {
        fileName: 'Factura venta MP 1.pdf',
        role: 'purchase',
        dateIso: '2025-07-21',
        detectedType: 'Peru Drawback: Raw Material Purchase Invoice',
      },
      {
        fileName: 'Guia de remision 1.pdf',
        role: 'rawMaterialTransport',
        dateIso: '2025-07-21',
        detectedType:
          'Peru Drawback: Raw Material Transport Guide (GRE to plant)',
      },
      {
        fileName: 'Factura de Maquila 1.pdf',
        role: 'packaging',
        dateIso: '2025-08-10',
        detectedType: 'Peru Drawback: Processing or Maquila Invoice',
      },
      {
        fileName: 'Factura de venta Israel 1.pdf',
        role: 'export',
        dateIso: '2025-08-08',
        detectedType: 'Peru Drawback: Commercial Export Invoice',
      },
    ]);
    expect(result.codes).toContain('export_before_packaging');
  });

  it('does not flag later MP purchase against earlier transport from another lot', () => {
    const result = evaluateDrawbackChronology([
      {
        fileName: 'Guia de remision 1.pdf',
        role: 'rawMaterialTransport',
        dateIso: '2025-07-21',
        detectedType:
          'Peru Drawback: Raw Material Transport Guide (GRE to plant)',
      },
      {
        fileName: 'Factura venta MP 5.pdf',
        role: 'purchase',
        dateIso: '2025-08-08',
        detectedType: 'Peru Drawback: Raw Material Purchase Invoice',
      },
      {
        fileName: 'Factura de Maquila 1.pdf',
        role: 'packaging',
        dateIso: '2025-08-10',
        detectedType: 'Peru Drawback: Processing or Maquila Invoice',
      },
      {
        fileName: 'Factura de venta Israel 1.pdf',
        role: 'export',
        dateIso: '2025-08-11',
        detectedType: 'Peru Drawback: Commercial Export Invoice',
      },
    ]);
    expect(result.codes).not.toContain('purchase_after_later_stage');
  });
});
