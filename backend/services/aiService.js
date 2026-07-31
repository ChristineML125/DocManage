//let Node.js can use Python Flask
import axios from "axios";
//this package for create this format
import FormData from "form-data";
//Node.js read file
import fs from "fs";
import path from "path";
import { convertDocxToPdf,
         convertXlsxToPdf,
 } from "../utils/convert.js";

export async function generateSummary(filePath) {
    try{
        console.log("AI Summary started:", filePath);

        // storage folder path
        const storagePath = path.join(
            process.cwd(),
            "..",
            "storage"
        );

        let pdfFilePath = filePath;

        const ext = path.extname(filePath).toLowerCase();

        // Convert different file types into PDF before AI summary
        if(ext === ".docx"){

            console.log("Converting DOCX to PDF...");
            pdfFilePath = await convertDocxToPdf(filePath);

        }else if(ext === ".xlsx"){

            console.log("Converting XLSX to PDF...");
            pdfFilePath = await convertXlsxToPdf(filePath);

        }else if(ext === ".pdf"){

            console.log("File already PDF");

        }else{
            throw new Error("Unsupported file type");

        }

        const fullPath = path.join(
           storagePath,
           pdfFilePath
        );

        const formData = new FormData();

        formData.append (
            "file",
            fs.createReadStream(fullPath)
        )

        const response = await axios.post(
            "http://localhost:5000/summary",
            formData,
            {
                headers: formData.getHeaders()
            }
        );

        return response.data.summary;
    } catch (err) {
        console.error("AI Summary Error:");
        console.error(err);
        return null;
    }

}