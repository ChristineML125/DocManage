import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { convertDocxToPdf, convertXlsxToPdf } from "../utils/convert.js";

export async function generateSummary(filePath) {
  console.log("AI Summary started:", filePath);

  const storagePath = path.join(process.cwd(), "..", "storage");
  const ext = path.extname(filePath).toLowerCase();
  let pdfFilePath = filePath;

  if (ext === ".docx") {
    pdfFilePath = await convertDocxToPdf(filePath);
  } else if (ext === ".xlsx") {
    pdfFilePath = await convertXlsxToPdf(filePath);
  } else if (ext !== ".pdf") {
    throw new Error(
      "AI Summary currently supports PDF, DOCX, and XLSX files. Image summaries require OCR support."
    );
  }

  const fullPath = path.join(storagePath, pdfFilePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error("The document file could not be found in storage.");
  }

  const formData = new FormData();
  formData.append("file", fs.createReadStream(fullPath));

  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:5000";
  let response;
  try {
    response = await axios.post(`${aiServiceUrl}/summary`, formData, {
      headers: formData.getHeaders(),
      timeout: 120000,
    });
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      throw new Error(
        `AI Summary service is unavailable at ${aiServiceUrl}. Start the AI service and try again.`
      );
    }
    throw new Error(err.response?.data?.message || `AI Summary service failed: ${err.message}`);
  }

  const summary = response.data?.summary;
  if (!summary || !summary.trim()) {
    throw new Error("AI Summary service returned no summary.");
  }

  return summary;
}
