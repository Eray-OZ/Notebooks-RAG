import axios from "axios";
import cacheService from "./cache";

const API_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleApiError = (error, functionName = "API function") => {
  console.error(`API Error details in ${functionName}:`, error); // Log the full error
  console.error(`Full error response:`, error.response); // Log the full response

  if (error.response) {
    throw error.response.data; // Throw the backend's { success: false, message: '...' } object
  } else if (error.request) {
    throw {
      success: false,
      message:
        "Could not reach the server. Please check your network connection or make sure the server is running.",
    };
  } else {
    throw {
      success: false,
      message: `An error occurred while creating the request: ${error.message}`,
    };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    handleApiError(error, "registerUser");
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await api.post("/auth/login", userData);
    return response.data;
  } catch (error) {
    handleApiError(error, "loginUser");
  }
};

export const getPublicNotebooks = async (skipCache = false) => {
  const cacheKey = "publicNotebooks";
  
  if (!skipCache) {
    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log("[Cache] Returning cached public notebooks");
      return cached;
    }
  }

  try {
    const response = await api.get("/notebooks/public");
    cacheService.set(cacheKey, response.data, 60000); // 60 saniye cache
    return response.data;
  } catch (error) {
    handleApiError(error, "getPublicNotebooks");
  }
};

export const getMyDocuments = async () => {
  try {
    const response = await api.get("/documents");
    return response.data;
  } catch (error) {
    handleApiError(error, "getMyDocuments");
  }
};

export const getMyNotebooks = async (skipCache = false) => {
  const cacheKey = "myNotebooks";
  
  if (!skipCache) {
    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log("[Cache] Returning cached my notebooks");
      return cached;
    }
  }

  try {
    const response = await api.get("/notebooks/mynotebooks");
    cacheService.set(cacheKey, response.data, 30000); // 30 saniye cache
    return response.data;
  } catch (error) {
    handleApiError(error, "getMyNotebooks");
  }
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("document", file);

  try {
    const response = await api.post("/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "uploadDocument");
  }
};

export const createNotebook = async (notebookData) => {
  try {
    const response = await api.post("/notebooks", notebookData);
    cacheService.invalidate("myNotebooks"); // Clear cache after creating
    cacheService.invalidate("publicNotebooks");
    return response.data;
  } catch (error) {
    handleApiError(error, "createNotebook");
  }
};

export const uploadDocumentToNotebook = async (notebookId, file) => {
  const formData = new FormData();
  formData.append("document", file);

  try {
    const response = await api.post(
      `/notebooks/${notebookId}/documents`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "uploadDocumentToNotebook");
  }
};

export const getNotebookById = async (notebookId) => {
  try {
    const response = await api.get(`/notebooks/${notebookId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, "getNotebookById");
  }
};

export const postMessageToNotebook = async (notebookId, message) => {
  try {
    const response = await api.post(`/notebooks/${notebookId}/messages`, {
      message: message,
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "postMessageToNotebook");
  }
};

export const associatedDocumentToNotebook = async (notebookId, documentId) => {
  try {
    const response = await api.patch(`/notebooks/${notebookId}/associate`, {
      documentId: documentId,
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "associateDocumentToNotebook");
  }
};

export const getNotebookPreviewById = async (notebookId) => {
  try {
    const response = await api.get(`/notebooks/${notebookId}/preview`);
    return response.data;
  } catch (error) {
    handleApiError(error, "getNotebookPreviewByID");
  }
};

export const updateNotebook = async (notebookId, updateData) => {
  try {
    const response = await api.patch(`/notebooks/${notebookId}`, updateData);
    cacheService.invalidate("myNotebooks");
    cacheService.invalidate("publicNotebooks");
    return response.data;
  } catch (error) {
    handleApiError(error, "updateNotebook");
  }
};

export const searchPublicNotebooks = async (query) => {
  try {
    const response = await api.get("/notebooks/search/public", {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "searchPublicNotebooks");
  }
};

export const getPublicNotebooksByCategory = async (categoryName) => {
  try {
    const response = await api.get(
      `/notebooks/category/${encodeURIComponent(categoryName)}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "getPublicNotebooksByCategory");
  }
};

export const cloneNotebook = async (notebookId) => {
  try {
    const response = await api.post(`/notebooks/${notebookId}/clone`);
    cacheService.invalidate("myNotebooks");
    return response.data;
  } catch (error) {
    handleApiError(error, "cloneNotebook");
  }
};

export const likeNotebook = async (notebookId) => {
  try {
    const response = await api.patch(`/notebooks/${notebookId}/like`);
    cacheService.invalidate("publicNotebooks");
    return response.data;
  } catch (error) {
    handleApiError(error, "likeNotebook");
  }
};

export default api;
