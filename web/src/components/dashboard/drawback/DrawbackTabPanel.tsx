import React, { useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  FileText,
  Globe,
  Scroll,
  Truck,
  UploadSimple,
  Warning,
  WarningCircle,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { PaymentsService } from "src/controller/PaymentsAPI.service";
import { ShipmentService } from "src/controller/ShipmentAPI.service";
import type { IMilestoneDetails, MilestoneEnum } from "src/interfaces/global";
import type { Payment } from "src/interfaces/payment";
import { downloadBlobOrOpenInNewTab } from "src/lib/vercel-blob";
import {
  buildDrawbackRequirementRows,
  collectDrawbackDocuments,
  drawbackRequirementUploadDescription,
  DRAWBACK_REQUIREMENT_IDS,
  type DrawbackRequirementId,
  type DrawbackRequirementRow,
  type DrawbackRequirementStatus,
  resolveDrawbackUploadTarget,
} from "src/lib/drawback-requirements";

interface DrawbackTabPanelProps {
  dealId: string;
  milestones: IMilestoneDetails[];
  payments: Payment[];
  currentMilestone: MilestoneEnum;
  dealCurrentMilestone?: MilestoneEnum;
  isSupplier: boolean;
  onUploadComplete: () => void;
}

const requirementIcons: Record<DrawbackRequirementId, React.ReactNode> = {
  rawMaterialPurchaseInvoice: <FileText size={20} className="text-[#64748B]" weight="duotone" />,
  rawMaterialTransportGuide: <Truck size={20} className="text-[#64748B]" weight="duotone" />,
  processingMaquilaInvoice: <FileText size={20} className="text-[#64748B]" weight="duotone" />,
  packingMaterialsInvoice: <FileText size={20} className="text-[#64748B]" weight="duotone" />,
  packagingContract: <Scroll size={20} className="text-[#64748B]" weight="duotone" />,
  internalPlantTransportGuide: <Truck size={20} className="text-[#64748B]" weight="duotone" />,
  commercialExportInvoice: <FileText size={20} className="text-[#64748B]" weight="duotone" />,
  exportTransportDocument: <Truck size={20} className="text-[#64748B]" weight="duotone" />,
  customsDeclarationDam: <Scroll size={20} className="text-[#64748B]" weight="duotone" />,
  swornDeclarationImportedInputs: <Globe size={20} className="text-[#64748B]" weight="duotone" />,
};

const statusBadgeStyles: Record<DrawbackRequirementStatus, string> = {
  verified: "bg-tm-green-transparent text-tm-primary-dark",
  pending: "bg-[#F1F5F9] text-[#475569]",
  missing: "bg-[#FFEDD5] text-[#9A3412]",
};

function StatusIcon({ status }: { status: DrawbackRequirementStatus }) {
  if (status === "verified") {
    return <CheckCircle size={14} weight="fill" className="text-tm-green" />;
  }
  if (status === "missing") {
    return <Warning size={14} weight="fill" className="text-[#EA580C]" />;
  }
  return <WarningCircle size={14} className="text-[#94A3B8]" />;
}

const DrawbackTabPanel: React.FC<DrawbackTabPanelProps> = ({
  dealId,
  milestones,
  payments,
  currentMilestone,
  dealCurrentMilestone,
  isSupplier,
  onUploadComplete,
}) => {
  const { t } = useTranslation(["shipment", "dashboard"]);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<DrawbackRequirementId | null>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const rowInputRefs = useRef<Partial<Record<DrawbackRequirementId, HTMLInputElement | null>>>({});

  const documents = useMemo(
    () => collectDrawbackDocuments(milestones, payments),
    [milestones, payments],
  );
  const requirements = useMemo(() => buildDrawbackRequirementRows(documents), [documents]);

  const uploadTarget = resolveDrawbackUploadTarget({
    isSupplier,
    dealCurrentMilestone,
    currentMilestone,
    milestones,
    payments,
  });

  const canUpload = Boolean(uploadTarget) && !uploading;

  const requirementHint = (req: DrawbackRequirementRow): string => {
    if (req.onFile && req.status !== "missing") {
      return t("drawback.panel.onFileNote", { ns: "dashboard" });
    }
    if (req.status === "missing") {
      return t(`drawback.requirementHints.${req.id}.missing`, { ns: "dashboard" });
    }
    return t(`drawback.requirementHints.${req.id}.pending`, { ns: "dashboard" });
  };

  const uploadFiles = async (files: File[], requirementId?: DrawbackRequirementId) => {
    if (!files.length) return;
    if (!uploadTarget) {
      toast.info(t("drawback.panel.uploadNotAvailable", { ns: "dashboard" }));
      return;
    }

    const pdfs = files.filter((f) => {
      const isPdf =
        f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        toast.error(t("drawback.panel.pdfOnly", { ns: "dashboard", filename: f.name }));
      }
      return isPdf;
    });
    if (!pdfs.length) return;

    setUploading(true);
    try {
      let results: PromiseSettledResult<void>[];

      if (uploadTarget.kind === "payment") {
        try {
          await PaymentsService.uploadPaymentDocuments(
            uploadTarget.paymentId,
            dealId,
            pdfs,
            { documentUploadMode: "drawback" },
          );
          results = [{ status: "fulfilled", value: undefined }];
        } catch {
          results = [{ status: "rejected", reason: new Error("upload failed") }];
        }
      } else {
        const uploads = pdfs.map(async (file) => {
          const description = requirementId
            ? drawbackRequirementUploadDescription(requirementId)
            : file.name;
          await ShipmentService.uploadDocToMilestone(
            { description, file, documentUploadMode: "drawback" },
            dealId,
            uploadTarget.milestoneId,
          );
        });
        results = await Promise.allSettled(uploads);
      }
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0 && failed < results.length) {
        toast.warn(t("drawback.panel.uploadPartial", { ns: "dashboard", count: failed }));
      } else if (failed === results.length) {
        toast.error(t("drawback.panel.uploadError", { ns: "dashboard" }));
      } else {
        toast.success(t("drawback.panel.uploadSuccess", { ns: "dashboard" }));
      }
      onUploadComplete();
    } catch {
      toast.error(t("drawback.panel.uploadError", { ns: "dashboard" }));
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadDocument = async (req: DrawbackRequirementRow) => {
    if (!req.documentUrl) return;
    setDownloadingId(req.id);
    try {
      await downloadBlobOrOpenInNewTab(
        req.documentUrl,
        t(`drawback.requirements.${req.id}`, { ns: "dashboard" }),
      );
    } catch {
      toast.error(t("toasts.downloadError", { ns: "shipment" }));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleBulkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    void uploadFiles(files);
  };

  const handleRowChange =
    (requirementId: DrawbackRequirementId) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file) void uploadFiles([file], requirementId);
    };

  return (
    <>
      <div className="hidden" aria-hidden>
        <input
          ref={bulkInputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={handleBulkChange}
        />
        {DRAWBACK_REQUIREMENT_IDS.map((id) => (
          <input
            key={id}
            ref={(el) => {
              rowInputRefs.current[id] = el;
            }}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleRowChange(id)}
          />
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="min-w-0 text-base font-semibold text-[#0F172A]">
              {t("drawback.panel.requirementsTitle", { ns: "dashboard" })}
            </h3>
            <button
              type="button"
              disabled={!canUpload}
              onClick={() => bulkInputRef.current?.click()}
              className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-[#0F172A] shadow-sm hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <UploadSimple size={16} weight="bold" />
              {uploading
                ? t("drawback.panel.uploading", { ns: "dashboard" })
                : t("drawback.panel.bulkUpload", { ns: "dashboard" })}
            </button>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            {t("drawback.panel.requirementsSubtitle", { ns: "dashboard" })}
          </p>
        </div>

        <ul className="divide-y divide-[#E2E8F0] overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
          {requirements.map((req) => (
            <li
              key={req.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 items-start gap-3 sm:flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC]">
                  {requirementIcons[req.id]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {t(`drawback.requirements.${req.id}`, { ns: "dashboard" })}
                  </p>
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    {req.documentLabel && req.onFile ? req.documentLabel : requirementHint(req)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeStyles[req.status]}`}
                >
                  <StatusIcon status={req.status} />
                  {t(`drawback.status.${req.status}`, { ns: "dashboard" })}
                </span>
                {req.onFile && req.documentUrl ? (
                  <button
                    type="button"
                    disabled={downloadingId === req.id}
                    onClick={() => void handleDownloadDocument(req)}
                    className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-60"
                  >
                    {downloadingId === req.id
                      ? t("drawback.panel.downloading", { ns: "dashboard" })
                      : t("drawback.panel.download", { ns: "dashboard" })}
                  </button>
                ) : null}
                {req.status === "missing" && canUpload ? (
                  <button
                    type="button"
                    onClick={() => rowInputRefs.current[req.id]?.click()}
                    className="inline-flex items-center gap-1 rounded-lg bg-tm-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-tm-primary-dark"
                  >
                    <UploadSimple size={14} weight="bold" />
                    {t("drawback.panel.upload", { ns: "dashboard" })}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default DrawbackTabPanel;
