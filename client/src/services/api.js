import axios from 'axios'

const API_URL = 'http://localhost:5000/api'


const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})



api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)




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


export const getPublicNotebooks = async () => {
    try {
        const response = await api.get('/notebooks/public')
        return response.data
    } catch (error) {
        throw error.response.data
    }
}


export const getMyDocuments = async () => {
    try {
        const response = await api.get('/documents')
        return response.data
    } catch (error) {
        throw error.response.data
    }
}


export const getMyNotebooks = async () => {
    try {
        const response = await api.get('/mynotebooks')
        return response.data
    } catch (error) {
        throw error.response.data
    }
}


export default api