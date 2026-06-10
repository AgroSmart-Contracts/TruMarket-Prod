import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { CloudArrowUp } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import {
  selectShipmentAgreementState,
  setShipmentAgreementState,
} from "src/store/createShipmentAgreementSlice";
import {
  buildSuggestionUpdates,
  type DealFieldSuggestions,
} from "src/lib/deal-document-analysis/apply-suggestions";
import { formatDetectedFields } from "src/lib/deal-document-analysis/format-detected-fields";

export type PendingDealDocument = {
  file: File;
  detectedType?: string;
};

interface UploadDealDocumentsProps {
  compact?: boolean;
  pendingDocuments: PendingDealDocument[];
  setPendingDocuments: React.Dispatch<React.SetStateAction<PendingDealDocument[]>>;
  onAnalyzingChange?: (analyzing: boolean) => void;
}

const UploadDealDocuments: React.FC<UploadDealDocumentsProps> = ({
  compact = false,
  pendingDocuments,
  setPendingDocuments,
  onAnalyzingChange,
}) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const formValues = useAppSelector(selectShipmentAgreementState);
  const [analyzing, setAnalyzingInternal] = useState(false);
  const [detectedRows, setDetectedRows] = useState<ReturnType<typeof formatDetectedFields>>([]);

  const setAnalyzing = (value: boolean) => {
    setAnalyzingInternal(value);
    onAnalyzingChange?.(value);
  };

  const applySuggestions = (suggestions: DealFieldSuggestions) => {
    dispatch(
      setShipmentAgreementState({ field: "documentSuggestions", value: suggestions }),
    );
    const updates = buildSuggestionUpdates(formValues, suggestions, {
      preferFromDocuments: true,
    });
    for (const { field, value } of updates) {
      dispatch(setShipmentAgreementState({ field, value }));
    }
    setDetectedRows(formatDetectedFields(suggestions));

    if (updates.length > 0) {
      toast.success(t("createShipment.documents.fieldsFilled", { count: updates.length }));
    }
  };

  const analyzeFiles = async (files: File[]) => {
    if (!files.length) return;
    try {
      setAnalyzing(true);
      const result = await ShipmentService.analyzeDealDocuments(files);
      setPendingDocuments((prev) => {
        const byName = new Map(prev.map((p) => [p.file.name, p]));
        for (const doc of result.documents) {
          const existing = byName.get(doc.fileName);
          if (existing) {
            existing.detectedType = doc.detectedType;
          }
        }
        return Array.from(byName.values());
      });
      applySuggestions(result.suggestions as DealFieldSuggestions);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        t("createShipment.documents.analyzeError");
      toast.error(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const valid: File[] = [];
      for (const file of acceptedFiles) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext !== "pdf" && file.type !== "application/pdf") {
          toast.error(t("createShipment.documents.notPdf", { name: file.name }));
          continue;
        }
        if (file.size > 30 * 1024 * 1024) {
          toast.error(t("createShipment.documents.tooLarge", { name: file.name }));
          continue;
        }
        valid.push(file);
      }
      if (!valid.length) return;

      let allPending: PendingDealDocument[] = [];
      setPendingDocuments((prev) => {
        const names = new Set(prev.map((p) => p.file.name));
        const added = valid.filter((f) => !names.has(f.name)).map((file) => ({ file }));
        allPending = [...prev, ...added];
        return allPending;
      });
      await analyzeFiles(allPending.map((p) => p.file));
    },
    [setPendingDocuments, t],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 20,
    disabled: analyzing,
  });

  const removeFile = (name: string) => {
    setPendingDocuments((prev) => prev.filter((p) => p.file.name !== name));
  };

  const content = (
    <>
      {!compact && (
        <p className="mb-4 text-sm text-[#64748B]">
          {t("createShipment.documents.hint")}
        </p>
      )}

      <div
        {...getRootProps()}
        className={`cursor-pointer border-2 border-dashed transition-colors ${
          compact
            ? "flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-lg px-4 py-3 text-center sm:flex-row sm:gap-2 sm:text-left"
            : "rounded-lg p-8 text-center"
        } ${
          isDragActive ? "border-tm-green bg-tm-green/5" : "border-[#E2E8F0] hover:border-tm-green/60 hover:bg-[#F8FAFC]"
        } ${analyzing ? "pointer-events-none opacity-60" : ""}`}
      >
        <input {...getInputProps()} />
        <CloudArrowUp
          size={compact ? 22 : 40}
          className={compact ? "shrink-0 text-tm-green/70" : "mx-auto mb-2 text-[#94A3B8]"}
        />
        <div className={compact ? "min-w-0" : undefined}>
          <p className={`text-tm-black-80 ${compact ? "text-[13px] font-medium" : "text-sm"}`}>
            {analyzing
              ? t("createShipment.documents.analyzing")
              : isDragActive
                ? t("createShipment.documents.dropHere")
                : t("createShipment.documents.dropOrClick")}
          </p>
          {compact && (
            <p className="text-[11px] text-[#64748B]">{t("createShipment.documents.pdfOnly")}</p>
          )}
        </div>
        {!compact && (
          <p className="mt-1 text-xs text-[#64748B]">{t("createShipment.documents.pdfOnly")}</p>
        )}
      </div>

      {pendingDocuments.length > 0 && (
        <ul
          className={
            compact
              ? "mt-2 flex flex-wrap gap-1.5"
              : "mt-4 space-y-2"
          }
        >
          {pendingDocuments.map(({ file, detectedType }) => (
            <li
              key={file.name}
              className={
                compact
                  ? "flex max-w-full items-center gap-2 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[12px]"
                  : "flex items-center justify-between rounded-md border border-[#E2E8F0] px-3 py-2 text-sm"
              }
            >
              <span className="truncate">
                {file.name}
                {detectedType && detectedType !== "Unknown" && (
                  <span className="ml-1 text-[#64748B]">({detectedType})</span>
                )}
              </span>
              <button
                type="button"
                className="shrink-0 text-tm-danger"
                onClick={() => removeFile(file.name)}
              >
                {t("createShipment.documents.remove")}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!compact && detectedRows.length > 0 && (
        <div className="mt-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <p className="mb-2 text-sm font-medium text-tm-black-80">
            {t("createShipment.documents.detectedTitle")}
          </p>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
            {detectedRows.map((row) => (
              <div key={row.key} className="flex flex-col">
                <dt className="text-[#64748B]">{row.label}</dt>
                <dd className="break-words font-medium text-tm-black-80">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-[11px] text-[#64748B]">
            {t("createShipment.documents.detectedNote")}
          </p>
        </div>
      )}

      {!compact && analyzing && (
        <p className="mt-2 text-sm text-[#64748B]">{t("createShipment.documents.analyzing")}</p>
      )}
    </>
  );

  return <div>{content}</div>;
};

export default UploadDealDocuments;
