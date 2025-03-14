import axios from "axios";

// const getIP = () => {
//     const host = window.location.hostname;
//     return host;
// }
const API_BASE_URL = `https://facultyfinder-backend-production.up.railway.app`; // Backend URL

// 🔹 Fetch faculty based on filters (name, department, specialization)
export const searchFaculty = async (filters) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/search`, { params: filters });
        return response.data;
    } catch (error) {
        console.error("Error fetching faculty data:", error);
        return [];
    }
};

// 🔹 Get faculty schedule based on emp_id
export const getFacultySchedule = async (emp_id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/schedule`, { params: { emp_id } });
        return response.data;
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return null;
    }
};

export const getDepartments = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/departments`);
        return response.data;
    } catch (error) {
        console.log("Error fetching department:", error);
        return null;
    }
}

export const getSepcifications = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/specializations`);
        return response.data;
    } catch (error) {
        console.log("Error fetch specifications:", error);
        return null;
    }
}