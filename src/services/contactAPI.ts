import axiosInstance from "./api";

// Mirrors the backend Contact model (learncodeai-backend/src/models/Contact.js).
export type ContactStatus =
  | "pending"
  | "in-progress"
  | "resolved"
  | "closed"
  | "replied";

export interface Contact {
  _id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  userId?: string | null;
  ipAddress?: string;
  userAgent?: string;
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFilters {
  search?: string;
  status?: ContactStatus | "";
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// The controller nests the collection under `data`, alongside pagination.
export interface ContactListResponse {
  status: string;
  data: {
    contacts: Contact[];
    pagination: Pagination;
  };
}

export interface ContactResponse {
  status: string;
  data: Contact;
  message?: string;
}

// POST /contact/:id/reply expects a subject and body, not a status change.
export interface ReplyPayload {
  subject: string;
  message: string;
}

export const contactAPI = {
  // Get all contact forms
  getAllContacts: (filters: ContactFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    return axiosInstance.get<ContactListResponse>(`/contact?${params}`);
  },

  // Reply to a specific contact
  replyToContact: (contactId: string, replyData: ReplyPayload) => {
    return axiosInstance.post<ContactResponse>(
      `/contact/${contactId}/reply`,
      replyData
    );
  },

  // Get a specific contact
  getContact: (contactId: string) => {
    return axiosInstance.get<ContactResponse>(`/contact/${contactId}`);
  },

  // Update contact status.
  // The backend route is PATCH /contact/:id — it has never had a /status
  // suffix, so the previous path 404'd on every call.
  updateContactStatus: (contactId: string, status: ContactStatus) => {
    return axiosInstance.patch<ContactResponse>(`/contact/${contactId}`, {
      status,
    });
  },

  // Delete a contact
  deleteContact: (contactId: string) => {
    return axiosInstance.delete<{ status: string; message?: string }>(
      `/contact/${contactId}`
    );
  },
};
