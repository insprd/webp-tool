import type { NextApiRequest, NextApiResponse } from "next";
import { unlink, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import formidable from "formidable";
import { existsSync, createReadStream } from "fs";

// Ensure the temp directory exists
const tempDir = "./temp";
if (!existsSync(tempDir)) {
  await mkdir(tempDir).catch(console.error);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  const form = new formidable.IncomingForm({
    uploadDir: "./temp",
    keepExtensions: true,
    maxFileSize: 100 * 1024 * 1024, // Limit file size to 100MB in bytes
    filter: (part) => allowedImageTypes.includes(part.mimetype), // Filter out disallowed file types
  });

  form.parse(req, async (err, _, files: any) => {
    if (err) {
      console.error("Form parsing error:", err);
      res.status(500).json({ error: "Error parsing the files" });
      return;
    }

    const uploadedFile = files.image;
    if (!uploadedFile) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    // Check if the uploaded file is empty or not allowed type
    if (
      uploadedFile.size === 0 ||
      !allowedImageTypes.includes(uploadedFile.type)
    ) {
      await unlink(uploadedFile.path); // make sure to remove the file
      res
        .status(400)
        .json({ error: "Uploaded file is empty or file type is not allowed" });
      return;
    }

    const uniqueFilename = `${uuidv4()}.webp`;
    const outputPath = `./temp/${uniqueFilename}`;

    try {
      await sharp(uploadedFile.path)
        .keepIccProfile()
        .webp({ lossless: true })
        .toFile(outputPath);

      res.setHeader("Content-Type", "image/webp");
      const readStream = createReadStream(outputPath);

      readStream.on("error", (streamError) => {
        console.error("Stream error:", streamError);
        unlink(outputPath); // Cleanup the output file
        unlink(uploadedFile.path); // Cleanup the uploaded file
        if (!res.headersSent) {
          res.status(500).json({ error: "Stream error occurred" });
        }
      });

      readStream.on("end", () => {
        unlink(outputPath);
        unlink(uploadedFile.path);
      });
      readStream.pipe(res);
    } catch (error) {
      console.error("Conversion error:", error); // Log the actual error
      await unlink(uploadedFile.path); // remove uploaded file since conversion failed
      res.status(500).json({ error: "Could not convert image to WebP" });
    }
  });
};
