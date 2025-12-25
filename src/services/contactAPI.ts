import axiosInstance from "./api";

export const contactAPI = {
  // Get all contact forms
  getAllContacts: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    return axiosInstance.get(`/contact?${params}`);
  },

  // Reply to a specific contact
  replyToContact: (contactId, replyData) => {
    return axiosInstance.post(`/contact/${contactId}/reply`, replyData);
  },

  // Get a specific contact
  getContact: (contactId) => {
    return axiosInstance.get(`/contact/${contactId}`);
  },

  // Update contact status
  updateContactStatus: (contactId, status) => {
    return axiosInstance.patch(`/contact/${contactId}/status`, { status });
  },

  // Delete a contact
  deleteContact: (contactId) => {
    return axiosInstance.delete(`/contact/${contactId}`);
  },
};

