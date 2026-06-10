import React, { useCallback, useState } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

import Button from "src/components/common/button";
import Loading from "src/components/common/loading";
import { getFileExtension } from "src/lib/helpers";
import { downloadBlobOrOpenInNewTab, isVercelBlobObjectUrl } from "src/lib/vercel-blob";

interface DocumentViewerProps {
  url: string;
  description?: string;
}

/**
 * Private Vercel Blob URLs cannot be opened in a new tab or embedded (no auth on the CDN host).
 * We fetch through the API with the user's JWT and save the file instead.
 */
const PrivateBlobDownloadPanel: React.FC<{ url: string; description?: string }> = ({
  url,
  description,
}) => {
  const [phase, setPhase] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const runDownload = useCallback(async () => {
    setPhase("loading");
    setMessage("");
    try {
      await downloadBlobOrOpenInNewTab(url, description || filenameFallback(url));
      setPhase("ok");
      setMessage("If you do not see the file, check blocked downloads in your browser’s address bar.");
    } catch {
      setPhase("error");
      setMessage(
        "Download failed. Stay logged in and use this button (direct blob links and background downloads are blocked by the browser).",
      );
    }
  }, [url, description]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <p className="max-w-lg text-[15px] leading-relaxed text-slate-700">
        This file is stored privately. It cannot be opened from a pasted URL. Browsers only allow saving
        when you click download here (not automatically in the background).
      </p>
      {phase === "loading" ? (
        <Loading />
      ) : message ? (
        <p className={`max-w-lg text-sm ${phase === "error" ? "text-red-700" : "text-slate-600"}`}>
          {message}
        </p>
      ) : null}
      <Button onClick={() => void runDownload()} disabled={phase === "loading"}>
        {phase === "ok" ? "Download again" : "Download file"}
      </Button>
    </div>
  );
};

function filenameFallback(blobUrl: string): string {
  try {
    const last = new URL(blobUrl).pathname.split("/").filter(Boolean).pop();
    return last?.replace(/\.[^.]+$/, "") || "document";
  } catch {
    return "document";
  }
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ url, description }) => {
  if (isVercelBlobObjectUrl(url)) {
    return <PrivateBlobDownloadPanel url={url} description={description} />;
  }

  return (
    <div>
      <DocViewer
        prefetchMethod="GET"
        style={{ width: "100%", height: "100vh", overflowY: "scroll" }}
        documents={[{ uri: url, fileType: getFileExtension(url) }]}
        pluginRenderers={DocViewerRenderers}
        config={{ pdfVerticalScrollByDefault: true }}
      />
    </div>
  );
};

export default DocumentViewer;
