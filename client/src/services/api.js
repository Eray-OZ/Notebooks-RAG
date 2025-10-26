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


const handleApiError = (error, functionName = 'API function') => {
    console.error(`API Error details in ${functionName}:`, error); // Hatanın tamamını logla
    console.error(`Full error response:`, error.response); // Log the full response

    if (error.response) {
        throw error.response.data; // Backend'in { success: false, message: '...' } objesini fırlat
    } else if (error.request) {
        throw { success: false, message: 'Sunucuya ulaşılamadı. Lütfen ağ bağlantınızı kontrol edin veya sunucunun çalıştığından emin olun.' };
    } else {
        throw { success: false, message: `İstek oluşturulurken bir hata oluştu: ${error.message}` };
    }
}



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
        const response = await api.get('/notebooks/mynotebooks')
        return response.data
    } catch (error) {
        throw error.response.data
    }
}


export const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append('document', file);

    try {
        const response = await api.post('/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};




export const createNotebook = async (notebookData) => { // 'title' parametresini alıyor
    try {
        const response = await api.post('/notebooks', notebookData);
        return response.data;
    } catch (error) {
        handleApiError(error, 'createNotebook'); // Yardımcı fonksiyonu kullan
    }
};



export const uploadDocumentToNotebook = async (notebookId, file) => {
    const formData = new FormData()
    formData.append('document', file)

    try {

        const response = await api.post(`/notebooks/${notebookId}/documents`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        handleApiError(error, 'uploadDocumentToNotebook')
    }
};



export const getNotebookById = async (notebookId) => {
    try {
        const response = await api.get(`/notebooks/${notebookId}`);
        return response.data;
    } catch (error) {
        handleApiError(error, 'getNotebookById');
    }
};



export const postMessageToNotebook = async (notebookId, message) => {
    try {

        const response = await api.post(`/notebooks/${notebookId}/messages`, { message: message });
        return response.data;
    } catch (error) {
        handleApiError(error, 'postMessageToNotebook');
    }
}



export const associatedDocumentToNotebook = async (notebookId, documentId) => {
    try {
        const response = await api.patch(`/notebooks/${notebookId}/associate`, { documentId: documentId })
        return response.data
    } catch (error) {
        handleApiError(error, 'associateDocumentToNotebook')
    }
}



export const getNotebookPreviewById = async (notebookId) => {
    try {
        const response = await api.get(`/notebooks/${notebookId}/preview`)
        return response.data
    } catch (error) {
        handleApiError(error, 'getNotebookPreviewByID')
    }
}




export const updateNotebook = async (notebookId, updateData) => {
    try {
        const response = await api.patch(`/notebook/${notebookId}`, updateData)
        return response.data
    } catch (error) {
        handleApiError(error, 'updateNotebook')
    }
}



export const searchPublicNotebooks = async (query) => {
    try {
        const response = await api.get('/notebooks/search/public',
            {
                params: { q: query }
            }
        )
        return response.data
    } catch (error) {
        handleApiError(error, 'searchPublicNotebooks')
    }
}



export const getPublicNotebooksByCategory = async (categoryName) => {
    try {
        const response = await api.get(`/notebooks/category/${encodeURIComponent(categoryName)}`)
        return response.data
    } catch (error) {
        handleApiError(error, 'getPublicNotebooksByCategory')
    }
}




export const cloneNotebook = async (notebookId) => {
    try {
        const response = await api.post(`/notebooks/${notebookId}/clone`)
        return response.data
    } catch (error) {
        handleApiError(error, 'cloneNotebook')
    }
}


export const likeNotebook = async (notebookId) => {
    try {
        const response = await api.patch(`/notebooks/${notebookId}/like`)
        return response.data
    } catch (error) {

    }
}



export default api