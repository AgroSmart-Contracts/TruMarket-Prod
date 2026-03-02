import React from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

import { getFileExtension } from "src/lib/helpers";

interface DocumentViewerProps {
  url: string;
  description?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ url, description }) => {
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
