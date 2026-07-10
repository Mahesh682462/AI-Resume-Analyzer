import api from './api';

const resumeService = {
  async upload(file, onProgress) {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    return response.data;
  },

  async getAll(page = 1, limit = 20) {
    const response = await api.get(`/resumes?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getOne(id) {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },

  async analyze(resumeId) {
    const response = await api.post(`/analysis/${resumeId}`);
    return response.data;
  },

  async getAnalysis(resumeId) {
    const response = await api.get(`/analysis/${resumeId}`);
    return response.data;
  },

  async getHistory(page = 1, limit = 20) {
    const response = await api.get(`/analysis/history/all?page=${page}&limit=${limit}`);
    return response.data;
  },

  async reanalyze(resumeId) {
    const response = await api.post(`/analysis/${resumeId}/reanalyze`);
    return response.data;
  }
};

export default resumeService;
