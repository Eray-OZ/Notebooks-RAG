import { readFile } from 'fs/promises'
import { PDFParse } from 'pdf-parse'


export const processDocument = async (filePath, fileType) => {
    let rawText = ''

    if (fileType === 'application/pdf') {
        const dataBuffer = await readFile(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        rawText = result.text;
        await parser.destroy();
    }

    else {
        rawText = await readFile(filePath, 'utf-8')
    }


    const chunkSize = 1000
    const chunkOverlap = 100
    const chunks = []


    for (let i = 0; i < rawText.length; i += chunkSize - chunkOverlap) {
        const chunk = rawText.substring(i, i + chunkSize)
        chunks.push(chunk)
    }

    console.log(`Oluşturulan chunk sayısı: ${chunks.length}`);

    return chunks
}