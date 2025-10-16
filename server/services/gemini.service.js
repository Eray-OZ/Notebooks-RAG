import config from '../config/index.js';

const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";



export const getEmbeddings = async (textChunks) => {
    const allEmbeddings = [];


    for (const chunk of textChunks) {
        try {
            const embedding = await embedSingleText(chunk);
            allEmbeddings.push(embedding);
        } catch (error) {
            console.error(`"${chunk.substring(0, 30)}..." metin parçası için embedding oluşturulamadı:`, error.message);
            throw new Error("Embedding işlemi sırasında bir veya daha fazla parçada hata oluştu.");
        }
    }

    return allEmbeddings;
};


async function embedSingleText(text) {

    const url = `${API_BASE_URL}/gemini-embedding-001:embedContent?key=${config.geminiApiKey}`;

    const requestBody = {
        model: "models/gemini-embedding-001",
        content: {
            parts: [{ text: text }]
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("--- GOOGLE'DAN GELEN HAM HATA METNİ (embedSingleText) ---", errorText);
        throw new Error(`Gemini API'sinden geçersiz veya boş hata cevabı alındı: ${errorText}`);
    }

    const data = await response.json();
    return data.embedding.values;
}





const generateContent = async (prompt) => {
    const modelName = 'gemini-2.5-flash'

    const url = `${API_BASE_URL}/${modelName}:generateContent?key=${config.geminiApiKey}`

    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }]
    }



    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error("Gemini Api Error " + errorData)
            throw new Error(errorData.error.message)
        }

        const data = await response.json()

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("Gemini'den geçerli bir cevap alınamadı.");
        }

        return data.candidates[0].content.parts[0].text
    } catch (error) {
        console.error(modelName + " Error")
        throw error
    }

}





export const generateChatCompletion = async (userPrompt, context) => {
    const prompt = `Sana verilen Döküman içeriğine dayanarak, kullanıcının sorusunu yanıtla. Sadece bu bilgilerden yararlan. Eğer bilgi dökümanların içeriğinde yoksa, "Bu konu hakkında bir bilgiye sahip değilim" cevabını ver. \n\nDöküman İçeriği:\n${context}\n\nKullanıcı Sorusu: ${userPrompt}`

    return generateContent(prompt)
}
