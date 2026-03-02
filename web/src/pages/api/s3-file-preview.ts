import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const file = req.query.fileUrl as string;

  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error("Failed to fetch the file");
    }

    const data = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", "attachment; filename=file.zip");
    res.send(Buffer.from(data));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "An error occurred" });
  }
}
