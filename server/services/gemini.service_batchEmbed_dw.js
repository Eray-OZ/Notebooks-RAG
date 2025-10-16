import config from '../config/index.js';

const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";


export const getEmbeddings = async (textChunks) => {

    const url = `${API_BASE_URL}/gemini-embedding-001:batchEmbed?key=${config.geminiApiKey}`;

    const requests = textChunks.map(chunk => ({
        model: "models/gemini-embedding-001",
        content: {
            parts: [{ text: chunk }],
        },
    }));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ requests: requests }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("--- GOOGLE'DAN GELEN HAM HATA METNİ ---", errorText);
            throw new Error(`Gemini API'sinden geçersiz veya boş hata cevabı alındı: ${errorText}`);
        }

        const data = await response.json();

        return data.embeddings.map(embedding => embedding.values);

    } catch (error) {
        console.error("Embedding fonksiyonunda hata oluştu:", error.message);
        throw error;
    }
};