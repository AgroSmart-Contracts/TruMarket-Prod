// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { AuthService } from "src/controller/AuthAPI.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const email = req.query.email as string;
  try {
    const response = await AuthService.requestOTPtoAccount({ email });
    res.status(200).json({ message: `One time code successfully sent to ${response.email}` });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data?.error_description });
  }
}
