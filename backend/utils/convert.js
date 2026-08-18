import mammoth from "mammoth";
import * as cheerio from "cheerio";
import XLSX from "xlsx";
import { PDFParse } from "pdf-parse";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import { jsPDF } from "jspdf";
import { isConfigured, getSupabase } from '../config/storage.js';
import fs from "fs";
import path from "path";

const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'documents';

function getStorageDir() {
    return path.join(process.cwd(), "..", "storage");
}

export async function getFileBuffer(filename) {
    if (isConfigured()) {
        const client = getSupabase();
        const { data, error } = await client.storage.from(BUCKET_NAME).download(filename);
        if (error || !data) throw new Error(`Failed to download ${filename} from Supabase: ${error?.message}`);
        return Buffer.from(await data.arrayBuffer());
    }
    return fs.readFileSync(path.join(getStorageDir(), filename));
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
    } else {
        const dir = getStorageDir();
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, filename), buffer);
    }
    return filename;
}

function makeDocxFromText(text) {
    const paragraphs = text.split("\n").filter(line => line.trim()).map(line =>
        new Paragraph({ children: [new TextRun({ text: line.trim(), size: 24 })] })
    );
    return Packer.toBuffer(new Document({
        sections: [{ properties: {}, children: paragraphs }]
    }));
}

function makePdfFromText(text) {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(text, 180);
    let y = 20;
    for (const line of lines) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, 15, y);
        y += 7;
    }
    return Buffer.from(doc.output("arraybuffer"));
}

function makeDocxFromRows(rows) {
    const tableRows = rows.map(row =>
        new TableRow({
            children: row.map(cell =>
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(cell || ""), size: 20 })] })] })
            )
        })
    );
    return Packer.toBuffer(new Document({
        sections: [{ properties: {}, children: [new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } })] }]
    }));
}

function makePdfFromRows(rows) {
    const doc = new jsPDF();
    let y = 15;
    for (const row of rows) {
        if (y > 270) { doc.addPage(); y = 15; }
        doc.text(row.join(" | "), 10, y);
        y += 6;
    }
    return Buffer.from(doc.output("arraybuffer"));
}

// ====== DOCX → PDF ======
export async function convertDocxToPdf(filename) {
    const buffer = await getFileBuffer(filename);
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || "";
    const pdfBuffer = makePdfFromText(text);
    const pdfName = filename.replace(/\.docx$/i, ".pdf");
    await saveConvertedFile(pdfBuffer, pdfName);
    return pdfName;
}

// ====== PDF → DOCX ======
export async function convertPdfToDocx(filename) {
    const buffer = await getFileBuffer(filename);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text || "";
    const docxBuffer = await makeDocxFromText(text);
    const docxName = filename.replace(/\.pdf$/i, ".docx");
    await saveConvertedFile(docxBuffer, docxName);
    return docxName;
}

// ====== XLSX → PDF ======
export async function convertXlsxToPdf(filename) {
    const buffer = await getFileBuffer(filename);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    let allRows = [];
    for (const sheetName of workbook.SheetNames) {
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        allRows.push([`--- ${sheetName} ---`]);
        allRows.push(...data);
    }
    const pdfBuffer = makePdfFromRows(allRows);
    const pdfName = filename.replace(/\.xlsx$/i, ".pdf");
    await saveConvertedFile(pdfBuffer, pdfName);
    return pdfName;
}

// ====== PDF → XLSX ======
export async function convertPdfToXlSX(filename) {
    const buffer = await getFileBuffer(filename);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const rows = result.text.split("\n").map(line => [line.trim()]).filter(row => row[0]);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "PDF Content");
    const xlsxBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const xlsxName = filename.replace(/\.pdf$/i, ".xlsx");
    await saveConvertedFile(xlsxBuffer, xlsxName);
    return xlsxName;
}

// ====== DOCX → XLSX ======
export async function convertDocxToXlsx(filename) {
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

    if (rows.length === 0) rows.push(["No content found"]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Document");
    const xlsxBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const xlsxName = filename.replace(/\.docx$/i, ".xlsx");
    await saveConvertedFile(xlsxBuffer, xlsxName);
    return xlsxName;
}

// ====== XLSX → DOCX ======
export async function convertXlsxToDocx(filename) {
    const buffer = await getFileBuffer(filename);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    let allRows = [];
    for (const sheetName of workbook.SheetNames) {
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        allRows.push([`--- ${sheetName} ---`]);
        allRows.push(...data);
    }
    const docxBuffer = await makeDocxFromRows(allRows);
    const docxName = filename.replace(/\.xlsx$/i, ".docx");
    await saveConvertedFile(docxBuffer, docxName);
    return docxName;
}
