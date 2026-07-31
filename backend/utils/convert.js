import mammoth from "mammoth";
import * as cheerio from "cheerio";
import XLSX from "xlsx";
import path from "path";
import { PDFParse } from "pdf-parse";
import fs from "fs";
import { exec } from "child_process";

export function convertDocxToPdf(filename){
    return new Promise((resolve,reject)=>{
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

        const command =
            `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf --outdir "${storageDir}" "${inputFile}"`;

        console.log("Command:", command);

        exec(command,(error,stdout,stderr)=>{
            console.log("LibreOffice stdout:", stdout);
            console.log("LibreOffice stderr:", stderr);

            if(error){
                console.error("LibreOffice error:", error);
                return reject(error);
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

export function convertPdfToDocx(filename){
    return new Promise((resolve,reject)=>{
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

        const pythonPath = "C:\\Users\\USER\\AppData\\Local\\Python\\bin\\python.exe";

        const command = `"${pythonPath}" convert.py "${inputFile}" "${outputPath}"`;

        console.log("Command:", command);

        exec(command,(error,stdout,stderr)=>{

            console.log(stdout);
            console.log(stderr);

            if(error){
                console.error("LibreOffice error:", error);
                reject(error);
                return;
            }
                
            resolve(outputFile);
        });
    });
}

export function convertXlsxToPdf(filename){
    return new Promise( async(resolve,reject)=>{

        if(typeof filename !== "string"){
            return reject(
                new Error("convertXlsxToPdf expects filename string")
            );
        }

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

        const command =
            `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf --outdir "${storageDir}" "${inputFile}"`;

        console.log("Command:", command);

        exec(command,(error,stdout,stderr)=>{
            console.log("LibreOffice stdout:", stdout);
            console.log("LibreOffice stderr:", stderr);

            if(error){
                console.error("LibreOffice error:", error);
                return reject(error);
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
