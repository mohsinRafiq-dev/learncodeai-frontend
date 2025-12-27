import api from "./api";

export interface CodeSnippet {
  language: string;
  code: string;
  filename?: string;
}

export interface Report {
  _id: string;
  reporter: {
    _id: string;
    username: string;
  };
  reason: "spam" | "inappropriate" | "harassment" | "off-topic" | "other";
  description?: string;
  createdAt: string;
}

export interface Comment {
  _id: string;
  author: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  content: string;
  codeSnippets: CodeSnippet[];
  upvotes: string[];
  downvotes: string[];
  voteScore: number;
  isAcceptedAnswer: boolean;
  isEdited: boolean;
  editedAt?: string;
  isHidden: boolean;
  hiddenReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Discussion {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  topic: string;
  tags: string[];
  type: "question" | "discussion" | "tutorial" | "announcement";
  codeSnippets: CodeSnippet[];
  comments: Comment[];
  upvotes: string[];
  downvotes: string[];
  voteScore: number;
  viewCount: number;
  commentCount: number;
  status: "open" | "answered" | "closed";
  isPinned: boolean;
  isLocked: boolean;
  isHidden: boolean;
  acceptedAnswer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionFilters {
  topic?: string;
  type?: string;
  status?: string;
  tags?: string;
  search?: string;
  sortBy?: "newest" | "oldest" | "popular" | "unanswered";
  page?: number;
  limit?: number;
}

export interface CreateDiscussionData {
  title: string;
  content: string;
  topic?: string;
  tags?: string[];
  type?: string;
  codeSnippets?: CodeSnippet[];
}

export interface CreateCommentData {
  content: string;
  codeSnippets?: CodeSnippet[];
}

const discussionAPI = {
  // Get all discussions with filters
  getDiscussions: async (filters?: DiscussionFilters) => {
    const response = await api.get("/discussions", { params: filters });
    return response.data;
  },

  // Get single discussion
  getDiscussion: async (discussionId: string) => {
    const response = await api.get(`/discussions/${discussionId}`);
    return response.data;
  },

  // Create discussion
  createDiscussion: async (data: CreateDiscussionData) => {
    const response = await api.post("/discussions", data);
    return response.data;
  },

  // Edit discussion
  editDiscussion: async (discussionId: string, data: Partial<CreateDiscussionData>) => {
    const response = await api.put(`/discussions/${discussionId}`, data);
    return response.data;
  },

  // Delete discussion
  deleteDiscussion: async (discussionId: string) => {
    const response = await api.delete(`/discussions/${discussionId}`);
    return response.data;
  },

  // Vote on discussion
  voteDiscussion: async (discussionId: string, voteType: "up" | "down" | "none") => {
    const response = await api.post(`/discussions/${discussionId}/vote`, { voteType });
    return response.data;
  },

  // Add comment
  addComment: async (discussionId: string, data: CreateCommentData) => {
    const response = await api.post(`/discussions/${discussionId}/comments`, data);
    return response.data;
  },

  // Edit comment
  editComment: async (discussionId: string, commentId: string, data: Partial<CreateCommentData>) => {
    const response = await api.put(`/discussions/${discussionId}/comments/${commentId}`, data);
    return response.data;
  },

  // Delete comment
  deleteComment: async (discussionId: string, commentId: string) => {
    const response = await api.delete(`/discussions/${discussionId}/comments/${commentId}`);
    return response.data;
  },

  // Vote on comment
  voteComment: async (discussionId: string, commentId: string, voteType: "up" | "down" | "none") => {
    const response = await api.post(`/discussions/${discussionId}/comments/${commentId}/vote`, { voteType });
    return response.data;
  },

  // Accept answer
  acceptAnswer: async (discussionId: string, commentId: string) => {
    const response = await api.post(`/discussions/${discussionId}/comments/${commentId}/accept`);
    return response.data;
  },

  // Report discussion
  reportDiscussion: async (discussionId: string, reason: string, description?: string) => {
    const response = await api.post(`/discussions/${discussionId}/report`, { reason, description });
    return response.data;
  },

  // Report comment
  reportComment: async (discussionId: string, commentId: string, reason: string, description?: string) => {
    const response = await api.post(`/discussions/${discussionId}/comments/${commentId}/report`, { reason, description });
    return response.data;
  },

  // Admin: Get forum stats
  getForumStats: async () => {
    const response = await api.get("/discussions/admin/stats");
    return response.data;
  },

  // Admin: Get reported content
  getReportedContent: async (page = 1, limit = 20) => {
    const response = await api.get("/discussions/admin/reports", { params: { page, limit } });
    return response.data;
  },

  // Admin: Moderate content
  moderateContent: async (
    discussionId: string,
    action: "hide" | "unhide",
    reason?: string,
    commentId?: string
  ) => {
    const endpoint = commentId
      ? `/discussions/${discussionId}/comments/${commentId}/moderate`
      : `/discussions/${discussionId}/moderate`;
    const response = await api.post(endpoint, { action, reason });
    return response.data;
  },

  // Admin: Lock/unlock discussion
  lockDiscussion: async (discussionId: string, lock: boolean) => {
    const response = await api.post(`/discussions/${discussionId}/lock`, { lock });
    return response.data;
  },

  // Admin: Pin/unpin discussion
  pinDiscussion: async (discussionId: string, pin: boolean) => {
    const response = await api.post(`/discussions/${discussionId}/pin`, { pin });
    return response.data;
  },

  // Admin: Dismiss report
  dismissReport: async (discussionId: string, reportId: string, commentId?: string) => {
    const endpoint = commentId
      ? `/discussions/${discussionId}/comments/${commentId}/reports/${reportId}`
      : `/discussions/${discussionId}/reports/${reportId}`;
    const response = await api.delete(endpoint);
    return response.data;
  },
};

export default discussionAPI;
