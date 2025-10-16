import axios from 'axios'

const API_URL = 'http://localhost:5000/api'


const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})


export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData)
        return response.data
    } catch (error) {
        throw error.response.data
    }
}


export const loginUser = async (userData) => {
    try {
        const response = await api.post('/auth/login', userData)
        return response.data
    } catch (error) {
        throw error.response.data
    }
}



export default api