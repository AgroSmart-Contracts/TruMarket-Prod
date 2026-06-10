import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { CloudArrowUp, FileText } from "@phosphor-icons/react";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import { saveAs } from "file-saver";
import Cookies from "js-cookie";

import Button, { ButtonVariants } from "src/components/common/button";
import { AccountTypeEnum, IMilestoneDetails, MilestoneEnum } from "src/interfaces/global";
import type { Payment } from "src/interfaces/payment";
import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import {
  collectShipmentTradeDocuments,
  type ShipmentTradeDocument,
} from "src/lib/shipment-trade-documents";
import { downloadBlobOrOpenInNewTab } from "src/lib/vercel-blob";
import { getFileExtension } from "src/lib/helpers";

import UploadedFileBox from "../attached-documents-view/uploaded-file-box";

interface ShipmentDocumentsTabProps {
  dealId: string;
  milestones: IMilestoneDetails[];
  payments: Payment[];
  currentMilestone: MilestoneEnum;
  dealCurrentMilestone?: MilestoneEnum;
  refetch: () => void;
  onUploadToPayment?: (paymentId: string) => void;
}

const ShipmentDocumentsTab: React.FC<ShipmentDocumentsTabProps> = ({
  dealId,
  milestones,
  payments,
  currentMilestone,
  dealCurrentMilestone,
  refetch,
  onUploadToPayment,
}) => {
  const { t } = useTranslation(["shipment", "documents", "common"]);
  const { accountType } = useUserInfo();
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const isSupplier = accountType === AccountTypeEnum.SUPPLIER;

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const documents = collectShipmentTradeDocuments(milestones, payments);
  const drawbackDocuments = documents.filter((d) => d.kind === "drawback");
  const tradeDocuments = documents.filter((d) => d.kind !== "drawback");
  const activeMilestone = milestones[currentMilestone];
  const canUploadMilestone =
    isSupplier &&
    dealCurrentMilestone === currentMilestone &&
    currentMilestone !== MilestoneEnum.M7 &&
    activeMilestone?.id;

  const uploadFiles = async (files: File[]) => {
    if (!canUploadMilestone || !activeMilestone?.id) {
      toast.info(t("documentsTab.uploadNotAvailable", { ns: "shipment" }));
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const mode = ext === "pdf" ? "payment" : "normal";
        await ShipmentService.uploadDocToMilestone(
          { description: file.name, file, documentUploadMode: mode as "payment" | "normal" },
          dealId,
          activeMilestone.id,
        );
      }
      await refetch();
      toast.success(t("documentsTab.uploadSuccess", { ns: "shipment" }));
    } catch {
      toast.error(t("documentsTab.uploadError", { ns: "shipment" }));
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (accepted) => void uploadFiles(accepted),
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 20,
    disabled: !canUploadMilestone || uploading,
    noClick: true,
    noKeyboard: true,
  });

  const handleDownload = async (doc: ShipmentTradeDocument) => {
    try {
      setDownloadingId(doc.id);
      await downloadBlobOrOpenInNewTab(doc.url, doc.label);
    } catch {
      toast.error(t("toasts.downloadError", { ns: "shipment" }));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!documents.length) return;
    setZipLoading(true);
    try {
      const jwt = Cookies.get("jwt");
      const payload = documents.map((d) => ({
        id: d.milestoneDocId || d.id,
        url: d.url,
        description: d.label,
        seen: d.seen ?? true,
        publiclyVisible: d.publiclyVisible ?? false,
      }));
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/s3-images-download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify({ uploadedFiles: payload }),
      });
      if (response.ok) {
        saveAs(await response.blob(), `trade-documents-${Date.now()}.zip`);
      } else {
        toast.error(t("toasts.downloadError", { ns: "shipment" }));
      }
    } catch {
      toast.error(t("toasts.downloadError", { ns: "shipment" }));
    } finally {
      setZipLoading(false);
    }
  };

  const handleVisibility = useCallback(
    async (docId: string, visible: boolean) => {
      const doc = documents.find((d) => d.milestoneDocId === docId);
      if (!doc?.milestoneId) return;
      try {
        await ShipmentService.updateDocumentVisibility(dealId, doc.milestoneId, docId, visible);
        await refetch();
      } catch {
        toast.error(t("documentsTab.visibilityError", { ns: "shipment" }));
      }
    },
    [dealId, documents, refetch, t],
  );

  const firstPaymentId = payments[0]?.id;

  const renderDocumentGrid = (sectionDocs: ShipmentTradeDocument[]) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {sectionDocs.map((doc) =>
        doc.source === "milestone" && doc.milestoneDocId && doc.milestoneId && !isBuyer ? (
          <UploadedFileBox
            key={doc.id}
            id={doc.milestoneDocId}
            milestoneId={doc.milestoneId}
            url={doc.url}
            description={doc.label}
            fileExtension={getFileExtension(doc.url)}
            seen={doc.seen}
            publiclyVisible={doc.publiclyVisible}
            handleChangeDocumentVisibility={handleVisibility}
          />
        ) : (
          <TradeDocumentCard
            key={doc.id}
            doc={doc}
            downloading={downloadingId === doc.id}
            onDownload={() => void handleDownload(doc)}
            isBuyer={isBuyer}
          />
        ),
      )}
    </div>
  );

  const renderSection = (
    titleKey: "labels.drawbackDocuments" | "labels.paymentDocuments",
    subtitleKey: "documentsTab.drawbackSubtitle" | "documentsTab.tradeSubtitle",
    emptyKey: "empty.noDrawbackDocs" | "empty.noPaymentDocs",
    emptyHintKey: "documentsTab.drawbackEmptyHint" | "documentsTab.emptyHint",
    sectionDocs: ShipmentTradeDocument[],
  ) => (
    <div className="rounded-xl border border-[#E5EAF2] bg-white overflow-hidden">
      <div className="border-b border-[#E5EAF2] px-4 py-3 sm:px-5">
        <h3 className="text-sm font-semibold text-[#0F172A]">{t(titleKey, { ns: "shipment" })}</h3>
        <p className="mt-1 text-xs text-[#64748B]">{t(subtitleKey, { ns: "shipment" })}</p>
      </div>
      <div className="p-4 sm:p-5">
        {sectionDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-10 text-center">
            <CloudArrowUp size={36} className="mb-2 text-[#94A3B8]" />
            <p className="text-sm font-medium text-[#0F172A]">{t(emptyKey, { ns: "shipment" })}</p>
            <p className="mt-1 max-w-md text-xs text-[#64748B]">{t(emptyHintKey, { ns: "shipment" })}</p>
          </div>
        ) : (
          renderDocumentGrid(sectionDocs)
        )}
      </div>
    </div>
  );

  const showDrawbackSection =
    isSupplier && (drawbackDocuments.length > 0 || tradeDocuments.length === 0);
  const showTradeSection = tradeDocuments.length > 0 || !isSupplier;

  return (
    <div className="space-y-4" {...getRootProps()}>
      <input {...getInputProps()} />

      {showDrawbackSection &&
        renderSection(
          "labels.drawbackDocuments",
          "documentsTab.drawbackSubtitle",
          "empty.noDrawbackDocs",
          "documentsTab.drawbackEmptyHint",
          drawbackDocuments,
        )}

      {showTradeSection &&
        renderSection(
          "labels.paymentDocuments",
          "documentsTab.tradeSubtitle",
          "empty.noPaymentDocs",
          "documentsTab.emptyHint",
          tradeDocuments,
        )}

      {documents.length === 0 && canUploadMilestone && (
        <div className="flex justify-center">
          <Button onClick={() => open()} loading={uploading}>
            {t("uploadDocuments", { ns: "shipment" })}
          </Button>
        </div>
      )}

      {documents.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-2 rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] px-4 py-3 sm:px-5">
          <Button
            variant={ButtonVariants.SECONDARY}
            loading={zipLoading}
            disabled={zipLoading}
            onClick={() => void handleDownloadAll()}
          >
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              {t("downloadDocuments", { ns: "shipment" })}
              <DownloadIcon className="!h-[18px] !w-[18px]" />
            </span>
          </Button>
          {canUploadMilestone && (
            <Button loading={uploading} disabled={uploading} onClick={() => open()}>
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                {t("uploadDocuments", { ns: "shipment" })}
                <UploadIcon className="!h-[18px] !w-[18px]" />
              </span>
            </Button>
          )}
          {isSupplier && firstPaymentId && onUploadToPayment && (
            <Button variant={ButtonVariants.OUTLINE} onClick={() => onUploadToPayment(firstPaymentId)}>
              {t("documentsTab.linkToPayment", { ns: "shipment" })}
            </Button>
          )}
        </div>
      )}

      {isBuyer && documents.length > 0 && (
        <p className="text-xs text-[#64748B]">{t("documentsTab.buyerNote", { ns: "shipment" })}</p>
      )}
    </div>
  );
};

function TradeDocumentCard({
  doc,
  downloading,
  onDownload,
  isBuyer,
}: {
  doc: ShipmentTradeDocument;
  downloading: boolean;
  onDownload: () => void;
  isBuyer: boolean;
}) {
  const { t } = useTranslation("shipment");
  const subtitle =
    doc.paymentSequence != null
      ? t("paymentNumber", { num: doc.paymentSequence })
      : doc.milestoneLabel;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm">
      <div className="flex items-start gap-2 border-b border-[#F1F5F9] bg-[#F8FAFC] p-3">
        <FileText size={28} className="shrink-0 text-tm-green" weight="duotone" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-semibold leading-snug text-[#0F172A]">{doc.label}</p>
          {subtitle && <p className="mt-0.5 text-[10px] text-[#64748B]">{subtitle}</p>}
        </div>
        {isBuyer && doc.seen === false && (
          <span className="shrink-0 rounded bg-slate-200 px-1 py-0.5 text-[10px] font-medium">new</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-[11px] text-[#64748B]" title={doc.fileName}>
          {doc.fileName}
        </p>
        <button
          type="button"
          disabled={downloading}
          onClick={onDownload}
          className="mt-auto w-full rounded-md border border-tm-green px-2 py-1.5 text-xs font-semibold text-tm-green hover:bg-tm-green/5 disabled:opacity-50"
        >
          {downloading ? t("downloading", { ns: "payments" }) : t("download", { ns: "common" })}
        </button>
      </div>
    </div>
  );
}

export default ShipmentDocumentsTab;
