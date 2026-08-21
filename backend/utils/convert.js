import mammoth from "mammoth";
import * as cheerio from "cheerio";
import XLSX from "xlsx";
import { PDFParse } from "pdf-parse";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { isConfigured, getSupabase } from '../config/storage.js';
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

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

async function downloadToLocal(filename) {
    const dir = getStorageDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const localPath = path.join(dir, filename);
    if (fs.existsSync(localPath)) return localPath;
    const buffer = await getFileBuffer(filename);
    fs.writeFileSync(localPath, buffer);
    return localPath;
}

function getLibreOfficePath() {
    if (os.platform() === "win32") {
        return "C:\\Program Files\\LibreOffice\\program\\soffice.exe";
    }
    return "libreoffice";
}

function hasLibreOffice() {
    return new Promise((resolve) => {
        execFile(getLibreOfficePath(), ["--version"], (error) => resolve(!error));
    });
}

function libreOfficeConvert(inputFile, format, outDir) {
    return new Promise((resolve) => {
        const args = ["--headless", "--convert-to", format, "--outdir", outDir, inputFile];
        console.log("LibreOffice command:", getLibreOfficePath(), args);
        execFile(getLibreOfficePath(), args, (error, stdout, stderr) => {
            console.log("LibreOffice stdout:", stdout);
            console.log("LibreOffice stderr:", stderr);
            if (error) {
                console.error("LibreOffice error:", error);
                return resolve(null);
            }
            resolve(true);
        });
    });
}

async function libreOfficeConvertAndSave(inputFile, outputName, format) {
    const dir = getStorageDir();
    const outputPath = path.join(dir, outputName);
    // Do not mistake an earlier conversion for the result of this request.
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    const ok = await libreOfficeConvert(inputFile, format, dir);
    if (!ok) return null;
    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) return null;
    const buffer = fs.readFileSync(outputPath);
    await saveConvertedFile(buffer, outputName);
    return outputName;
}

// ====== DOCX → PDF ======
export async function convertDocxToPdf(filename) {
    const localFile = await downloadToLocal(filename);
    const pdfName = filename.replace(/\.docx$/i, ".pdf");

    if (await hasLibreOffice()) {
        const result = await libreOfficeConvertAndSave(localFile, pdfName, "pdf");
        if (result) return result;
    }

    const buffer = await getFileBuffer(filename);
    const result = await mammoth.convertToHtml({ buffer });
    const html = result.value || "";
    const pdfBuffer = makePdfFromHtml(html);
    await saveConvertedFile(pdfBuffer, pdfName);
    return pdfName;
}

// ====== PDF → DOCX ======
export async function convertPdfToDocx(filename) {
    const localFile = await downloadToLocal(filename);
    const docxName = filename.replace(/\.pdf$/i, ".docx");
    const outputPath = path.join(getStorageDir(), docxName);

    console.log("=================================");
    console.log("PDF → DOCX conversion");
    console.log("Input:", localFile);
    console.log("Output:", docxName);
    console.log("=================================");

    // LibreOffice supports DOCX export from Writer documents, but a PDF is not
    // a Writer document.  Its PDF import filter cannot reliably export DOCX,
    // especially in minimal Linux deployments.  Use the dedicated converter.
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    const python = process.env.PYTHON_BIN || (os.platform() === "win32" ? "python" : "python3");
    const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "convert.py");

    await new Promise((resolve, reject) => {
        execFile(python, [script, localFile, outputPath], (error, stdout, stderr) => {
            console.log("pdf2docx stdout:", stdout);
            console.log("pdf2docx stderr:", stderr);
            if (error) return reject(new Error(`PDF to DOCX conversion failed: ${stderr || error.message}`));
            resolve();
        });
    });

    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
        throw new Error("PDF to DOCX conversion failed: no DOCX file was produced.");
    }

    await saveConvertedFile(fs.readFileSync(outputPath), docxName);
    const result = docxName;

    console.log("PDF → DOCX conversion completed:", result);
    return result;
}

// ====== XLSX → PDF ======
export async function convertXlsxToPdf(filename) {
    const localFile = await downloadToLocal(filename);
    const pdfName = filename.replace(/\.xlsx$/i, ".pdf");

    if (await hasLibreOffice()) {
        const result = await libreOfficeConvertAndSave(localFile, pdfName, "pdf");
        if (result) return result;
    }

    const buffer = await getFileBuffer(filename);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheets = workbook.SheetNames.map(name => ({
        name,
        rows: XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 })
    }));
    const pdfBuffer = makePdfFromSheet(sheets);
    await saveConvertedFile(pdfBuffer, pdfName);
    return pdfName;
}

// ====== PDF → XLSX ======
export async function convertPdfToXlSX(filename) {
    const xlsxName = filename.replace(/\.pdf$/i, ".xlsx");

    if (await hasLibreOffice()) {
        const localFile = await downloadToLocal(filename);
        const result = await libreOfficeConvertAndSave(localFile, xlsxName, "xlsx");
        if (result) return result;
    }

    const buffer = await getFileBuffer(filename);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const rows = result.text.split("\n").map(line => [line.trim()]).filter(row => row[0]);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "PDF Content");
    const xlsxBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    await saveConvertedFile(xlsxBuffer, xlsxName);
    return xlsxName;
}

// ====== DOCX → XLSX ======
export async function convertDocxToXlsx(filename) {
    const xlsxName = filename.replace(/\.docx$/i, ".xlsx");

    if (await hasLibreOffice()) {
        const localFile = await downloadToLocal(filename);
        const result = await libreOfficeConvertAndSave(localFile, xlsxName, "xlsx");
        if (result) return result;
    }

    const buffer = await getFileBuffer(filename);
    const result = await mammoth.convertToHtml({ buffer });
    const html = result.value;
    const $ = cheerio.load(html);
    const allRows = [];
    let hasTables = false;

    $("table").each((_, table) => {
        hasTables = true;
        $(table).find("tr").each((_, tr) => {
            const row = [];
            $(tr).find("td, th").each((_, cell) => {
                row.push($(cell).text().trim());
            });
            if (row.length > 0) allRows.push(row);
        });
        allRows.push([]);
    });

    if (!hasTables) {
        $("p, h1, h2, h3, h4, h5, h6, li, tr").each((_, el) => {
            const text = $(el).text().trim();
            if (text) allRows.push([text]);
        });
    }

    const imgCount = $("img").length;
    if (imgCount > 0) {
        allRows.push([]);
        allRows.push([`[${imgCount} image(s) in original document]`]);
    }

    if (allRows.length === 0) allRows.push(["No content found"]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(allRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Document");
    const xlsxBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    await saveConvertedFile(xlsxBuffer, xlsxName);
    return xlsxName;
}

// ====== XLSX → DOCX ======
export async function convertXlsxToDocx(filename) {
    const docxName = filename.replace(/\.xlsx$/i, ".docx");

    if (await hasLibreOffice()) {
        const localFile = await downloadToLocal(filename);
        const result = await libreOfficeConvertAndSave(localFile, docxName, "docx");
        if (result) return result;
    }

    const buffer = await getFileBuffer(filename);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const allChildren = [];

    for (const sheetName of workbook.SheetNames) {
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        if (data.length === 0) continue;

        allChildren.push(new Paragraph({
            children: [new TextRun({ text: sheetName, bold: true, size: 28 })],
            spacing: { before: 200, after: 100 }
        }));

        const maxCols = Math.max(...data.map(r => r.length));
        const normalizedRows = data.map(r => {
            while (r.length < maxCols) r.push("");
            return r.map(c => String(c ?? ""));
        });

        const tableRows = normalizedRows.map((row, rowIdx) =>
            new TableRow({
                children: row.map(cell =>
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, bold: rowIdx === 0 })] })],
                        shading: rowIdx === 0 ? { fill: "2980B9" } : undefined
                    })
                )
            })
        );

        allChildren.push(new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE }
        }));
    }

    if (allChildren.length === 0) {
        allChildren.push(new Paragraph({ children: [new TextRun({ text: "No content found", size: 24 })] }));
    }

    const docxBuffer = await Packer.toBuffer(new Document({
        sections: [{ properties: {}, children: allChildren }]
    }));
    await saveConvertedFile(docxBuffer, docxName);
    return docxName;
}

// ====== PDF fallback helpers ======
function makePdfFromHtml(htmlContent) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const $ = cheerio.load(htmlContent);

    function checkPage(needed) {
        if (y + needed > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
        }
    }

    function processNode(node) {
        const tagName = node.tagName?.toLowerCase();
        if (tagName === "h1") { checkPage(12); doc.setFontSize(22); doc.setFont("helvetica", "bold"); const lines = doc.splitTextToSize($(node).text(), contentWidth); lines.forEach(l => { checkPage(9); doc.text(l, margin, y); y += 9; }); y += 4; resetFont(); }
        else if (tagName === "h2") { checkPage(10); doc.setFontSize(18); doc.setFont("helvetica", "bold"); const lines = doc.splitTextToSize($(node).text(), contentWidth); lines.forEach(l => { checkPage(8); doc.text(l, margin, y); y += 8; }); y += 3; resetFont(); }
        else if (tagName === "h3") { checkPage(9); doc.setFontSize(15); doc.setFont("helvetica", "bold"); const lines = doc.splitTextToSize($(node).text(), contentWidth); lines.forEach(l => { checkPage(7); doc.text(l, margin, y); y += 7; }); y += 3; resetFont(); }
        else if (["h4","h5","h6"].includes(tagName)) { checkPage(8); doc.setFontSize(13); doc.setFont("helvetica", "bold"); const lines = doc.splitTextToSize($(node).text(), contentWidth); lines.forEach(l => { checkPage(7); doc.text(l, margin, y); y += 7; }); y += 2; resetFont(); }
        else if (tagName === "table") {
            const rows = [];
            $(node).find("tr").each((_, tr) => {
                const row = [];
                $(tr).find("td, th").each((_, cell) => { row.push($(cell).text().trim()); });
                if (row.length > 0) rows.push(row);
            });
            if (rows.length > 0) {
                checkPage(10);
                autoTable(doc, { startY: y, head: [rows[0]], body: rows.slice(1), margin: { left: margin, right: margin }, styles: { fontSize: 9, cellPadding: 3 }, headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: "bold" }, alternateRowStyles: { fillColor: [245, 245, 245] }, theme: "grid" });
                y = doc.lastAutoTable.finalY + 5;
            }
        }
        else if (tagName === "p" || tagName === "div") {
            const line = $(node).text().trim();
            if (line) {
                doc.setFontSize(11);
                const lines = doc.splitTextToSize(line, contentWidth);
                lines.forEach(l => { checkPage(6); doc.text(l, margin, y); y += 5.5; });
                y += 2;
            }
        }
        else if (tagName === "ul" || tagName === "ol") {
            $(node).find("li").each((i, li) => {
                checkPage(6); doc.setFontSize(11);
                const bullet = tagName === "ol" ? `${i+1}. ` : "\u2022 ";
                doc.text(bullet + $(li).text().trim(), margin + 3, y); y += 5.5;
            });
            y += 2;
        }
        else if (tagName === "br") { y += 4; }
        else if (tagName === "hr") { checkPage(5); doc.setDrawColor(180); doc.line(margin, y, pageWidth - margin, y); y += 5; }
        else if (tagName === "img") {
            const src = $(node).attr("src") || "";
            if (src.startsWith("data:image/")) {
                const match = src.match(/^data:image\/(\w+);base64,(.+)$/);
                if (match) {
                    let format = match[1].toUpperCase();
                    if (format === "JPG") format = "JPEG";
                    if (!["PNG", "JPEG", "GIF", "BMP", "WEBP"].includes(format)) format = "PNG";

                    const imgWidth = contentWidth;
                    let imgHeight = 40;

                    try {
                        const props = doc.getImageProperties(src);
                        const ratio = props.height / props.width;
                        imgHeight = Math.min(imgWidth * ratio, doc.internal.pageSize.getHeight() - margin * 2);
                    } catch (_) {}

                    checkPage(imgHeight + 5);
                    try {
                        doc.addImage(src, format, margin, y, imgWidth, imgHeight);
                        y += imgHeight + 5;
                    } catch (e) {
                        console.error("PDF img addImage failed:", e.message);
                        checkPage(6);
                        doc.setFontSize(9);
                        doc.setTextColor(150);
                        doc.text("[Image]", margin, y);
                        y += 6;
                        doc.setTextColor(0);
                    }
                }
            } else {
                checkPage(6);
                doc.setFontSize(9);
                doc.setTextColor(150);
                doc.text("[Image]", margin, y);
                y += 6;
                doc.setTextColor(0);
            }
        }
        else if (!["head","meta","title","style","script","link"].includes(tagName)) {
            $(node).contents().each((_, child) => processNode(child));
        }
    }

    function resetFont() { doc.setFontSize(11); doc.setFont("helvetica", "normal"); }
    $.root().contents().each((_, node) => processNode(node));
    return Buffer.from(doc.output("arraybuffer"));
}

function makePdfFromSheet(sheets) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 15;
    sheets.forEach((sheet, idx) => {
        if (idx > 0) doc.addPage();
        doc.setFontSize(14); doc.setFont("helvetica", "bold");
        doc.text(sheet.name, margin, margin + 5);
        if (sheet.rows.length > 0) {
            const maxCols = Math.max(...sheet.rows.map(r => r.length));
            const normalizedRows = sheet.rows.map(r => { while (r.length < maxCols) r.push(""); return r.map(c => String(c ?? "")); });
            autoTable(doc, { startY: margin + 12, head: [normalizedRows[0]], body: normalizedRows.slice(1), margin: { left: margin, right: margin }, styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: [33, 37, 41], textColor: [255, 255, 255], fontStyle: "bold" }, alternateRowStyles: { fillColor: [248, 249, 250] }, theme: "grid" });
        }
    });
    return Buffer.from(doc.output("arraybuffer"));
}

function makeDocxFromText(text) {
    const paragraphs = text.split("\n").filter(line => line.trim()).map(line =>
        new Paragraph({ children: [new TextRun({ text: line.trim(), size: 24 })] })
    );
    return Packer.toBuffer(new Document({
        sections: [{ properties: {}, children: paragraphs }]
    }));
}

// ====== IMAGE → PDF ======
export async function convertImageToPdf(filename) {
    const buffer = await getFileBuffer(filename);
    const ext = path.extname(filename).toLowerCase().replace(".", "");
    const formatMap = { png: "PNG", jpg: "JPEG", jpeg: "JPEG", webp: "JPEG", bmp: "BMP", gif: "GIF", heic: "JPEG", heif: "JPEG" };
    const format = formatMap[ext] || "PNG";

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;

    const base64 = `data:image/${format === "JPEG" ? "jpeg" : ext};base64,${buffer.toString("base64")}`;

    try {
        const props = doc.getImageProperties(base64);
        const imgRatio = props.width / props.height;
        const availW = pageWidth - margin * 2;
        const availH = pageHeight - margin * 2;
        let drawW, drawH;

        if (imgRatio > availW / availH) {
            drawW = availW;
            drawH = availW / imgRatio;
        } else {
            drawH = availH;
            drawW = availH * imgRatio;
        }

        const x = (pageWidth - drawW) / 2;
        const y = (pageHeight - drawH) / 2;
        doc.addImage(base64, format, x, y, drawW, drawH);
    } catch (e) {
        console.error("Image→PDF fallback:", e.message);
        doc.setFontSize(12);
        doc.text("[Could not render image]", margin, pageHeight / 2);
    }

    const pdfName = filename.replace(/\.\w+$/, ".pdf");
    await saveConvertedFile(Buffer.from(doc.output("arraybuffer")), pdfName);
    return pdfName;
}

// ====== IMAGE → DOCX ======
export async function convertImageToDocx(filename) {
    const buffer = await getFileBuffer(filename);
    const ext = path.extname(filename).toLowerCase().replace(".", "");
    const mimeMap = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", bmp: "image/bmp", gif: "image/gif", heic: "image/jpeg", heif: "image/jpeg" };
    const mime = mimeMap[ext] || "image/png";
    const base64Str = buffer.toString("base64");

    const { ImageRun } = await import("docx");
    const imgRun = new ImageRun({
        data: base64Str,
        transformation: { width: 500, height: 600 },
        type: ext === "png" ? "png" : "jpg",
    });

    const docxBuffer = await Packer.toBuffer(new Document({
        sections: [{ properties: {}, children: [
            new Paragraph({ children: [imgRun] })
        ] }]
    }));
    const docxName = filename.replace(/\.\w+$/, ".docx");
    await saveConvertedFile(docxBuffer, docxName);
    return docxName;
}

// ====== IMAGE → XLSX ======
export async function convertImageToXlsx(filename) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
        ["[Image file - content cannot be represented in spreadsheet]"],
        ["Original file: " + path.basename(filename)]
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Image");
    const xlsxBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const xlsxName = filename.replace(/\.\w+$/, ".xlsx");
    await saveConvertedFile(xlsxBuffer, xlsxName);
    return xlsxName;
}
