import { connect } from '@lancedb/lancedb'
import { v4 as uuidv4 } from 'uuid'


const db = await connect('data/lancedb')


export const addVectors = async (tableName, chunks, embeddings) => {
    const data = chunks.map((chunk, index) => ({
        id: uuidv4(),
        text: chunk,
        vector: embeddings[index]
    }))


    try {
        const table = await db.createTable(tableName, data)
        console.log("LanceDB table creadet/updated")
        return table
    } catch (error) {
        console.error(`LanceDB error: ${error}`)
        throw error
    }

}




export const searchVectors = async (tableName, queryEmbedding, topN = 5) => {
    try {


        console.log(`--- Vector Service: searchVectors BAŞLADI ---`);
        console.log(`Aranacak Tablo: ${tableName}`);
        if (!tableName) {
            console.error("HATA: Tablo adı 'undefined' veya boş! Arama yapılamaz.");
            return "";
        }


        const table = await db.openTable(tableName)
        console.log(`Tablo '${tableName}' başarıyla açıldı.`);

        const results = await table.search(queryEmbedding).limit(topN).execute()
        console.log(`Tablo '${tableName}' için sonuç sayısı: ${results.length}`);

        const context = results.map(r => r.text).join('\n---\n')
        return context
    } catch (error) {
        if (error.message.includes('table not found')) {
            console.error(`Table Not Found ${tableName}`)
        }
        else {
            console.error(error)
        }
        return ""
    }
}