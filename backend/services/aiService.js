import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import XLSX from "xlsx";
import { getFileBuffer } from "../utils/convert.js";

async function extractText(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    const buffer = await getFileBuffer(filename);

    if (ext === "pdf") {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        return result.text || "";
    }

    if (ext === "docx") {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || "";
    }

    if (ext === "xlsx" || ext === "xls") {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        let text = "";
        for (const sheetName of workbook.SheetNames) {
            text += XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]) + "\n";
        }
        return text;
    }

    if (ext === "txt") {
        return buffer.toString("utf-8");
    }

    throw new Error(`Unsupported file type for AI Summary: ${ext}`);
}

function summarizeText(text, maxSentences = 10) {
    if (!text || text.trim().length === 0) {
        return "No content found in the document to summarize.";
    }

    const sentences = text
        .replace(/\n+/g, " ")
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 15);

    if (sentences.length === 0) {
        return "No meaningful content found in the document.";
    }

    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const freq = {};
    for (const w of words) {
        freq[w] = (freq[w] || 0) + 1;
    }

    const stopWords = new Set(["the","and","for","are","but","not","you","all","can","had","her","was","one","our","out","has","his","how","its","may","new","now","old","see","way","who","did","get","let","say","she","too","use","this","that","with","have","from","they","been","said","each","make","like","just","over","such","take","year","them","some","than","them","when","what","your","will","would","there","their","about","which","when","make","like","time","very","when","come","could","more","than","also"]);
    const scored = sentences.map(s => {
        const sWords = s.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        const score = sWords.reduce((sum, w) => sum + (freq[w] || 0), 0) / (sWords.length || 1);
        return { s, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const selected = scored.slice(0, maxSentences).map(item => item.s);
    return selected.join("\n");
}

export async function generateSummary(filePath) {
    console.log("AI Summary started:", filePath);
    const text = await extractText(filePath);
    return summarizeText(text);
}
