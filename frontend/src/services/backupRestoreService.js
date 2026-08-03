import axiosInstance from "./axiosInstance";

const BACKUP_BASE_PATH = "/admin/backup";

export const backupRestoreService = {
  async getLatestBackup(signal) {
    const response = await axiosInstance.get(`${BACKUP_BASE_PATH}/latest`, {
      signal,
    });
    return response.data;
  },

  async runBackup() {
    const response = await axiosInstance.post(`${BACKUP_BASE_PATH}/run`);
    return response.data;
  },

  async restoreBackup(file) {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await axiosInstance.post(`${BACKUP_BASE_PATH}/restore`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // Optional: We can specify timeout if restoration takes a long time
      timeout: 30000, 
    });
    return response.data;
  },
};
