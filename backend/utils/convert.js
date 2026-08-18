import mammoth from "mammoth";
import * as cheerio from "cheerio";
import XLSX from "xlsx";
import path from "path";
import { PDFParse } from "pdf-parse";
import fs from "fs";
import { exec } from "child_process";
import os from "os";

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

export async function convertDocxToPdf(filename){
        const storageDir = path.join(
            process.cwd(),
            "..",
            "storage"
        );

        const inputFile = path.join(
            storageDir,
            filename
        );

        console.log("PDF output folder:", storageDir);
        console.log("Input file:", inputFile);

        const available = await hasLibreOffice();
        if (!available) {
            console.warn("LibreOffice not available, skipping DOCX to PDF conversion");
            return null;
        }

        const command =
            `${getLibreOfficePath()} --headless --convert-to pdf --outdir "${storageDir}" "${inputFile}"`;

        console.log("Command:", command);

        return new Promise((resolve, reject) => {
            exec(command,(error,stdout,stderr)=>{
                console.log("LibreOffice stdout:", stdout);
                console.log("LibreOffice stderr:", stderr);

                if(error){
                    console.error("LibreOffice error:", error);
                    return resolve(null);
                }

                const pdfName =
                    filename.replace(
                        /\.docx$/i,
                        ".pdf"
                    );

                resolve(pdfName);
            });
        });
}

export async function convertPdfToDocx(filename){
        const storageDir = path.join(
            process.cwd(),
            "..",
            "storage"
        );

        const inputFile = path.join(
            storageDir,
            filename
        );

        const outputFile = filename.replace(/\.pdf$/i,".docx");

        const outputPath = path.join(storageDir, outputFile);

        const available = await hasLibreOffice();
        if (!available) {
            console.warn("LibreOffice not available, skipping PDF to DOCX conversion");
            return null;
        }

        const command = `${getLibreOfficePath()} --headless --convert-to docx --outdir "${storageDir}" "${inputFile}"`;

        console.log("Command:", command);

        return new Promise((resolve,reject) => {
            exec(command,(error,stdout,stderr)=>{
                console.log(stdout);
                console.log(stderr);

                if(error){
                    console.error("LibreOffice error:", error);
                    return resolve(null);
                }
                    
                resolve(outputFile);
            });
        });
}

export async function convertXlsxToPdf(filename){
        if(typeof filename !== "string"){
            throw new Error("convertXlsxToPdf expects filename string");
        }

        const storageDir = path.join(process.cwd(), "..", "storage");
        const inputFile = path.join(storageDir, filename);

        console.log("PDF output folder:", storageDir);
        console.log("Input file:", inputFile);

        const available = await hasLibreOffice();
        if (!available) {
            console.warn("LibreOffice not available, skipping XLSX to PDF conversion");
            return null;
        }

        const command = `${getLibreOfficePath()} --headless --convert-to pdf --outdir "${storageDir}" "${inputFile}"`;
        console.log("Command:", command);

        return new Promise((resolve, reject) => {
            exec(command,(error,stdout,stderr)=>{
                console.log("LibreOffice stdout:", stdout);
                console.log("LibreOffice stderr:", stderr);

                if(error){
                    console.error("LibreOffice error:", error);
                    return resolve(null);
                }

            const pdfName =
                filename.replace(
                    /\.xlsx$/i,
                    ".pdf"
                );

            resolve(pdfName);
        });
    });
}

export function convertPdfToXlSX(filename){

    return new Promise(async(resolve,reject)=>{

        try{

            const storageDir = path.join(
                process.cwd(),
                "..",
                "storage"
            );

            const inputFile = path.join(
                storageDir,
                filename
            );


            const buffer = fs.readFileSync(inputFile);

            const parser = new PDFParse({
                data: buffer
            });

            const data = await parser.getText();

            const rows = data.text
                .split("\n")
                .map(line=>[
                    line.trim()
                ])
                .filter(row=>row[0]);

            const workbook =
                XLSX.utils.book_new();

            const worksheet =
                XLSX.utils.aoa_to_sheet(rows);

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "PDF Content"
            );


            const xlsxName =
                filename.replace(
                    /\.pdf$/i,
                    ".xlsx"
                );


            XLSX.writeFile(
                workbook,
                path.join(storageDir,xlsxName)
            );


            resolve(xlsxName);


        }catch(err){

            console.error(
                "PDF to XLSX failed:",
                err
            );

            reject(err);

        }

    });
}

export function convertDocxToXlsx(filename){
    return new Promise(async(resolve,reject)=>{
        try{
            const storageDir = path.join(
                process.cwd(),
                "..",
                "storage"
            );

            const inputFile = path.join(
                storageDir,
                filename
            );

            console.log("Input file:", inputFile);

            // DOCX -> HTML
            const result = await mammoth.convertToHtml({
                path: inputFile
            });

            const html = result.value;

            const $ = cheerio.load(html);

            const rows = [];

            $("body")
            .contents()
            .each((i, element)=>{

                const text = $(element)
                    .text()
                    .trim();

                if(text){
                    rows.push([
                        text
                    ]);
                }

            });

            $("table tr").each((i, tr)=>{

                const row = [];

                $(tr).find("td, th").each((j, cell)=>{

                    row.push(
                        $(cell).text().trim()
                    );

                });

                $("p, h1, h2, h3, li")
                .each((i,el)=>{

                    const text=$(el)
                        .text()
                        .trim();

                    if(text){
                        rows.push([text]);
                    }

                });


                if(row.length > 0){
                    rows.push(row);
                }

            });

            if(rows.length === 0){

                $("p").each((i,p)=>{

                    const text =
                        $(p).text().trim();

                    if(text){
                        rows.push([text]);
                    }

                });

            }

            if(rows.length === 0){

                rows.push([
                    "No content found"
                ]);

            }

            const workbook =
                XLSX.utils.book_new();


            const worksheet =
                XLSX.utils.aoa_to_sheet(rows);


            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Document"
            );


            const xlsxName =
                filename.replace(
                    /\.docx$/i,
                    ".xlsx"
                );


            const outputPath =
                path.join(
                    storageDir,
                    xlsxName
                );


            XLSX.writeFile(
                workbook,
                outputPath
            );


            console.log(
                "Excel created:",
                outputPath
            );

            resolve(xlsxName);

        }
        catch(error){
            console.error(
                "DOCX to XLSX error:",
                error
            );

            reject(error);

        }

    });

}
