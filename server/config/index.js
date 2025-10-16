import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })


const config = {
    port: process.env.PORT,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    geminiApiKey: process.env.GEMINI_API_KEY
}

export default config