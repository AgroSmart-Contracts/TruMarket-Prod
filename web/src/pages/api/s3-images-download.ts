import type { NextApiRequest, NextApiResponse } from "next";
import JSZip from "jszip";

import { getFileExtension } from "src/lib/helpers";
import { isVercelBlobObjectUrl } from "src/lib/vercel-blob";
import { IUploadedFileProps } from "src/interfaces/global";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || typeof authHeader !== "string") {
        return res.status(401).json({ error: "Authorization required" });
      }

      const { uploadedFiles } = req.body;
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      if (!apiBase) {
        return res.status(500).json({ error: "NEXT_PUBLIC_API_URL is not configured" });
      }

      const zip = new JSZip();

      const remoteZips = uploadedFiles.map(async (file: IUploadedFileProps) => {
        const fetchUrl = isVercelBlobObjectUrl(file.url)
          ? `${apiBase.replace(/\/$/, "")}/storage/document?url=${encodeURIComponent(file.url)}`
          : file.url;
        const headers: HeadersInit = isVercelBlobObjectUrl(file.url)
          ? { Authorization: authHeader }
          : {};
        const response = await fetch(fetchUrl, { headers });
        if (!response.ok) {
          throw new Error(`Failed to fetch ${file.description}: ${response.status}`);
        }
        const data = await response.arrayBuffer();
        zip.file(`${file.description}.${getFileExtension(file.url)}`, data);
      });

      await Promise.all(remoteZips);

      const content = await zip.generateAsync({ type: "nodebuffer" });

      res.setHeader("Content-Disposition", `attachment; filename=milestone-files-${Date.now()}.zip`);
      res.setHeader("Content-Type", "application/zip");

      return res.status(200).send(content);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to zip and download files." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
