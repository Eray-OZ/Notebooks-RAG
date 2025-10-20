import dotenv from 'dotenv'

dotenv.config()


const config = {
    port: process.env.PORT,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    geminiApiKey: process.env.GEMINI_API_KEY,
    hfToken: process.env.HF_TOKEN
}

export default config