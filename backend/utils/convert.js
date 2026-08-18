import mammoth from "mammoth";
import * as cheerio from "cheerio";
import XLSX from "xlsx";
import path from "path";
import { PDFParse } from "pdf-parse";
import fs from "fs";
import os from "os";
import { exec } from "child_process";
import { isConfigured, getSupabase } from '../config/storage.js';

const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'documents';

function getStorageDir() {
    return path.join(process.cwd(), "..", "storage");
}

function getLibreOfficePath() {
    const platform = os.platform();
    if (platform === "win32") {
        return '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"';
    }
    return "libreoffice";
}

function hasLibreOffice() {
    return new Promise((resolve) => {
        const cmd = `${getLibreOfficePath()} --version`;
        exec(cmd, (error) => resolve(!error));
    });
}

async function getFileBuffer(filename) {
    if (isConfigured()) {
        const client = getSupabase();
        const { data, error } = await client.storage.from(BUCKET_NAME).download(filename);
        if (error || !data) throw new Error(`Failed to download ${filename} from Supabase: ${error?.message}`);
        return Buffer.from(await data.arrayBuffer());
    }
    const filePath = path.join(getStorageDir(), filename);
    return fs.readFileSync(filePath);
}

async function saveConvertedFile(buffer, filename) {
    if (isConfigured()) {
        const client = getSupabase();
        const ext = filename.split('.').pop().toLowerCase();
        const mimeTypes = {
            pdf: 'application/pdf',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
        const { error } = await client.storage.from(BUCKET_NAME).upload(filename, buffer, {
            contentType: mimeTypes[ext] || 'application/octet-stream',
            upsert: true
        });
        if (error) throw error;
        return filename;
    }
    const storageDir = getStorageDir();
    if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
    fs.writeFileSync(path.join(storageDir, filename), buffer);
    return filename;
}

export async function convertDocxToPdf(filename) {
    const storageDir = getStorageDir();
    if (isConfigured()) {
        if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
        const buffer = await getFileBuffer(filename);
        const inputFile = path.join(storageDir, filename);
        fs.writeFileSync(inputFile, buffer);
    }
    const inputFile = path.join(storageDir, filename);

    const available = await hasLibreOffice();
    if (!available) {
        console.warn("LibreOffice not available, skipping DOCX to PDF conversion");
        return null;
    }

    const pdfName = filename.replace(/\.docx$/i, ".pdf");
    const command = `${getLibreOfficePath()} --headless --convert-to pdf --outdir "${storageDir}" "${inputFile}"`;
    console.log("DOCX->PDF Command:", command);

    return new Promise((resolve) => {
        exec(command, async (error, stdout, stderr) => {
            console.log("LibreOffice stdout:", stdout);
            console.log("LibreOffice stderr:", stderr);
            if (error) {
                console.error("LibreOffice error:", error);
                return resolve(null);
            }
            try {
                const pdfPath = path.join(storageDir, pdfName);
                if (fs.existsSync(pdfPath)) {
                    const pdfBuffer = fs.readFileSync(pdfPath);
                    await saveConvertedFile(pdfBuffer, pdfName);
                }
            } catch (e) { console.error("Upload converted PDF failed:", e); }
            resolve(pdfName);
        });
    });
}

export async function convertPdfToDocx(filename) {
    const storageDir = getStorageDir();
    if (isConfigured()) {
        if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
        const buffer = await getFileBuffer(filename);
        const inputFile = path.join(storageDir, filename);
        fs.writeFileSync(inputFile, buffer);
    }
    const inputFile = path.join(storageDir, filename);
    const outputFile = filename.replace(/\.pdf$/i, ".docx");

    const available = await hasLibreOffice();
    if (!available) {
        console.warn("LibreOffice not available, skipping PDF to DOCX conversion");
        return null;
    }

    const command = `${getLibreOfficePath()} --headless --convert-to docx --outdir "${storageDir}" "${inputFile}"`;
    console.log("PDF->DOCX Command:", command);

    return new Promise((resolve) => {
        exec(command, async (error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (error) {
                console.error("LibreOffice error:", error);
                return resolve(null);
            }
            try {
                const docxPath = path.join(storageDir, outputFile);
                if (fs.existsSync(docxPath)) {
                    const docxBuffer = fs.readFileSync(docxPath);
                    await saveConvertedFile(docxBuffer, outputFile);
                }
            } catch (e) { console.error("Upload converted DOCX failed:", e); }
            resolve(outputFile);
        });
    });
}

export async function convertXlsxToPdf(filename) {
    if (typeof filename !== "string") {
        throw new Error("convertXlsxToPdf expects filename string");
    }
    const storageDir = getStorageDir();
    if (isConfigured()) {
        if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
        const buffer = await getFileBuffer(filename);
        const inputFile = path.join(storageDir, filename);
        fs.writeFileSync(inputFile, buffer);
    }
    const inputFile = path.join(storageDir, filename);

    const available = await hasLibreOffice();
    if (!available) {
        console.warn("LibreOffice not available, skipping XLSX to PDF conversion");
        return null;
    }

    const pdfName = filename.replace(/\.xlsx$/i, ".pdf");
    const command = `${getLibreOfficePath()} --headless --convert-to pdf --outdir "${storageDir}" "${inputFile}"`;
    console.log("XLSX->PDF Command:", command);

    return new Promise((resolve) => {
        exec(command, async (error, stdout, stderr) => {
            console.log("LibreOffice stdout:", stdout);
            console.log("LibreOffice stderr:", stderr);
            if (error) {
                console.error("LibreOffice error:", error);
                return resolve(null);
            }
            try {
                const pdfPath = path.join(storageDir, pdfName);
                if (fs.existsSync(pdfPath)) {
                    const pdfBuffer = fs.readFileSync(pdfPath);
                    await saveConvertedFile(pdfBuffer, pdfName);
                }
            } catch (e) { console.error("Upload converted PDF failed:", e); }
            resolve(pdfName);
        });
    });
}

export async function convertPdfToXlSX(filename) {
    try {
        const buffer = await getFileBuffer(filename);
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();

        const rows = data.text
            .split("\n")
            .map(line => [line.trim()])
            .filter(row => row[0]);

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, "PDF Content");

        const xlsxName = filename.replace(/\.pdf$/i, ".xlsx");
        const xlsxBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        await saveConvertedFile(xlsxBuffer, xlsxName);
        return xlsxName;
    } catch (err) {
        console.error("PDF to XLSX failed:", err);
        return null;
    }
}

export async function convertDocxToXlsx(filename) {
    try {
        const buffer = await getFileBuffer(filename);
        const result = await mammoth.convertToHtml({ buffer });
        const html = result.value;
        const $ = cheerio.load(html);
        const rows = [];

        $("body").contents().each((i, element) => {
            const text = $(element).text().trim();
            if (text) rows.push([text]);
        });

        $("table tr").each((i, tr) => {
            const row = [];
            $(tr).find("td, th").each((j, cell) => {
                row.push($(cell).text().trim());
            });
            $("p, h1, h2, h3, li").each((i, el) => {
                const text = $(el).text().trim();
                if (text) rows.push([text]);
            });
            if (row.length > 0) rows.push(row);
        });

        if (rows.length === 0) {
            $("p").each((i, p) => {
                const text = $(p).text().trim();
                if (text) rows.push([text]);
            });
        }

        if (rows.length === 0) {
            rows.push(["No content found"]);
        }

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Document");

        const xlsxName = filename.replace(/\.docx$/i, ".xlsx");
        const xlsxBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        await saveConvertedFile(xlsxBuffer, xlsxName);
        return xlsxName;
    } catch (error) {
        console.error("DOCX to XLSX error:", error);
        return null;
    }
}
