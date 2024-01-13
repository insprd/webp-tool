// pages/api/read-icc.ts

import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import sharp from "sharp";
import { parse } from "icc";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, _, files: any) => {
    if (err) {
      res.status(500).json({ error: "Form parsing error" });
      return;
    }

    const uploadedFile = files.image;
    if (!uploadedFile) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    try {
      const metadata = await sharp(uploadedFile.path).metadata();
      let iccProfileBase64, iccProfileDescription;

      if (metadata.icc) {
        // Convert the ICC Buffer to base64.
        iccProfileBase64 = Buffer.from(metadata.icc).toString("base64");
        // Parse the ICC profile buffer to get a description.
        const iccProfile = parse(metadata.icc);
        iccProfileDescription =
          iccProfile?.description || "Description not available";
      }

      res.status(200).json({
        iccProfileBase64,
        iccProfileDescription,
      });
    } catch (error) {
      console.error("Failed to fetch ICC Profile:", error);
      res.status(500).json({ error: "Failed to read ICC Profile" });
    }
  });
};
