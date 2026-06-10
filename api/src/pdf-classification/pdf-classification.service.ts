import { Injectable } from '@nestjs/common';

import { logger } from '@/logger';
import {
  classifyAndExtractPdfBuffer,
  classifyPeruDrawbackPdfBuffer,
  type ExtractedDocumentFields,
} from '@/pdf-trade-classifier';

import { PERU_DRAWBACK_VALIDATION_RULES } from './peru-drawback-validation-rules';

export type TradePdfClassificationPayload = {
  detectedType: string;
  score: number;
  matchedKeywords: string[];
};

export type DrawbackPdfClassificationPayload = TradePdfClassificationPayload & {
  processStage?: number;
  documentDateIso?: string;
  boxCount?: number | null;
  validationRulesetId: string;
  validationRulesVersion: number;
};

export type TradePdfAnalysisResult = {
  classification: TradePdfClassificationPayload;
  extracted: ExtractedDocumentFields;
};

@Injectable()
export class PdfClassificationService {
  isPdf(file: { mimetype?: string; originalname?: string }): boolean {
    if (file.mimetype && file.mimetype.toLowerCase() === 'application/pdf') {
      return true;
    }
    const name = (file.originalname || '').toLowerCase();
    return name.endsWith('.pdf');
  }

  /**
   * Classify + extract structured trade fields from trade PDFs.
   * Single entry point for payment docs, deal creation analysis, and milestone uploads.
   */
  async classifyAndExtractTradePdf(
    buffer: Buffer,
    fileName: string,
  ): Promise<TradePdfAnalysisResult | null> {
    if (!buffer?.length) {
      return null;
    }
    try {
      const result = await classifyAndExtractPdfBuffer(
        new Uint8Array(buffer),
        fileName,
      );
      return {
        classification: {
          detectedType: String(result.classification.type),
          score: result.classification.score,
          matchedKeywords: result.classification.matchedKeywords,
        },
        extracted: result.extracted,
      };
    } catch (err) {
      logger.warn({ err, fileName }, 'trade PDF classify+extract failed');
      return null;
    }
  }

  async classifyTradePdf(
    buffer: Buffer,
    fileName: string,
  ): Promise<TradePdfClassificationPayload | null> {
    const analysis = await this.classifyAndExtractTradePdf(buffer, fileName);
    return analysis?.classification ?? null;
  }

  async classifyPeruDrawbackPdf(
    buffer: Buffer,
    fileName: string,
  ): Promise<DrawbackPdfClassificationPayload | null> {
    if (!buffer?.length) {
      return null;
    }
    try {
      const result = await classifyPeruDrawbackPdfBuffer(
        new Uint8Array(buffer),
        fileName,
      );
      const p = result.peruDrawback;
      return {
        detectedType: String(p.type),
        score: p.score,
        matchedKeywords: p.matchedKeywords,
        processStage: p.processStage,
        documentDateIso: p.documentDateIso,
        boxCount: p.boxCount ?? null,
        validationRulesetId: PERU_DRAWBACK_VALIDATION_RULES.id,
        validationRulesVersion: PERU_DRAWBACK_VALIDATION_RULES.version,
      };
    } catch (err) {
      logger.warn({ err, fileName }, 'Peru drawback PDF classification failed');
      return null;
    }
  }

  shouldClassify(
    file: { mimetype?: string; originalname?: string },
    mode: string | undefined,
  ): boolean {
    if (!this.isPdf(file)) {
      return false;
    }
    return mode === 'payment' || mode === 'drawback';
  }
}
