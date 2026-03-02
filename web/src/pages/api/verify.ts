// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { AuthService } from "src/controller/AuthAPI.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const email = req.query.email as string;
  const otp = req.query.otp as string;

  try {
    const response = await AuthService.requestJWTtoAccount({ email, otp });
    res.status(200).json({ authOJWT: response.id_token });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data?.error_description });
  }
}
