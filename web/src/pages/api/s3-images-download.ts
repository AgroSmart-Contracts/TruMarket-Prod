import type { NextApiRequest, NextApiResponse } from "next";
import JSZip from "jszip";
import axios from "axios";

import { getFileExtension } from "src/lib/helpers";
import { IUploadedFileProps } from "src/interfaces/global";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { uploadedFiles } = req.body;

      const zip = new JSZip();

      const remoteZips = uploadedFiles.map(async (file: IUploadedFileProps) => {
        const response = await fetch(file.url);
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
