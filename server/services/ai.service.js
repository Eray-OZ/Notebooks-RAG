import config from '../config/index.js';



const HF_API_BASE_URL = "https://api-inference.huggingface.co/models/";


export const getEmbeddings = async (textChunks) => {
    const model = "intfloat/multilingual-e5-large";
    console.log(`Embedding alınıyor...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);

    try {
        const response = await fetch(`${HF_API_BASE_URL}${model}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.hfToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ inputs: textChunks }),
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("--- HUGGING FACE'DEN GELEN HAM HATA ---", errorText);
            throw new Error(`Hugging Face API hatası: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();

        if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
            console.log("Tüm embedding işlemleri başarıyla tamamlandı.");
            return result;
        } else {
            console.error("Hugging Face'den beklenmedik çıktı formatı:", result);
            throw new Error("Hugging Face modelinden geçersiz embedding formatı alındı.");
        }

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error("Hugging Face API isteği zaman aşımına uğradı (120 saniye).");
            throw new Error("İstek zaman aşımına uğradı.");
        }
        console.error("--- HUGGING FACE API İSTEĞİNDE BEKLENMEDİK HATA ---", error);
        throw error;
    }
}



const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

const generateContent = async (prompt) => {
    const modelName = 'gemini-2.5-flash'
    const url = `${GEMINI_API_BASE_URL}/models/${modelName}:generateContent?key=${config.geminiApiKey}`

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
    const prompt = `Sana verilen Döküman içeriğine dayanarak, kullanıcının sorusunu yanıtla. Sadece bu bilgilerden yararlan. Eğer bilgi dökümanların içeriğinde yoksa, "Bu konu hakkında bir bilgiye sahip değilim" cevabını ver. 

Döküman İçeriği:
${context}

Kullanıcı Sorusu: ${userPrompt}`

    return generateContent(prompt)
}