import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Ban,
  CheckCircle,
  X,
  Eye,
  Calendar,
  Award,
} from "lucide-react";
import { adminAPI } from "../../../services/adminAPI";
import { useToast } from "../../../contexts/ToastContext";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";

interface UserManagementProps {
  onError?: (message: string) => void;
  highlightedUserId?: string;
}

export default function UserManagement({
  highlightedUserId,
}: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedUser, setHighlightedUser] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    userId: string | null;
  }>({
    show: false,
    userId: null,
  });
  const { showToast } = useToast();

  const [emailFormData, setEmailFormData] = useState({
    subject: "",
    message: "",
  });

  const [suspendFormData, setSuspendFormData] = useState({
    reason: "",
  });

  // Handle highlighting
  useEffect(() => {
    if (highlightedUserId) {
      setHighlightedUser(highlightedUserId);
      // Remove highlight after animation
      setTimeout(() => {
        setHighlightedUser(null);
      }, 3000);
    }
  }, [highlightedUserId]);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers(
        pagination.currentPage,
        10,
        searchTerm,
        roleFilter,
        statusFilter
      );
      setUsers(response.data || []);
      setPagination(
        response.pagination || { total: 0, pages: 0, currentPage: 1 }
      );
    } catch (error) {
      showToast("Failed to load users", "error");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    try {
      setLoading(true);
      await adminAPI.updateUserStatus(
        selectedUser._id,
        "suspended",
        suspendFormData.reason
      );
      showToast("User suspended successfully", "success");
      setShowSuspendModal(false);
      setSuspendFormData({ reason: "" });
      fetchUsers();
    } catch (error) {
      showToast("Failed to suspend user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (user: any) => {
    try {
      setLoading(true);
      await adminAPI.updateUserStatus(user._id, "active");
      showToast("User activated successfully", "success");
      fetchUsers();
    } catch (error) {
      showToast("Failed to activate user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      if (!emailFormData.subject || !emailFormData.message) {
        showToast("Please fill in all fields", "error");
        return;
      }
      setLoading(true);
      await adminAPI.sendEmailToUser(
        selectedUser._id,
        emailFormData.subject,
        emailFormData.message
      );
      showToast("Email sent successfully", "success");
      setShowEmailModal(false);
      setEmailFormData({ subject: "", message: "" });
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to send email",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm.userId) return;

    try {
      setLoading(true);
      await adminAPI.deleteUser(deleteConfirm.userId);
      showToast("User deleted successfully", "success");
      setDeleteConfirm({ show: false, userId: null });
      fetchUsers();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to delete user",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (user: any, newRole: string) => {
    try {
      setLoading(true);
      await adminAPI.changeUserRole(user._id, newRole);
      showToast(`User role changed to ${newRole}`, "success");
      fetchUsers();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to change role",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-gray-400 mb-1">
              Admin Panel / Users
            </div>
            <h1 className="text-3xl font-bold text-gray-100">
              User Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage users, suspend accounts, and send notifications
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0d1230] rounded-lg shadow-sm border border-[#2a3050] p-4 mb-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div className="w-48">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">User Role: All</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-52">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Account Status: All</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#0d1230] rounded-lg shadow-sm border border-[#2a3050] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1a1f3e] border-b border-[#2a3050]">
                <th className="w-8 px-4 py-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#2a3050] bg-[#1a1f3e]"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  User ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Date Joined
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Last Active
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className={`border-b border-[#2a3050] hover:bg-[#1a1f3e] transition-all duration-300 ${
                      highlightedUser === user._id
                        ? "bg-purple-900/30 border-l-4 border-l-purple-500 border-r-4 border-r-purple-500 border-t-2 border-t-purple-400 border-b-2 border-b-purple-400 shadow-lg shadow-purple-500/20 animate-pulse"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-[#2a3050] bg-[#1a1f3e]"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-100">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      {user._id?.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user, e.target.value)}
                        className="text-sm bg-[#1a1f3e] border border-[#2a3050] text-gray-200 rounded px-2 py-1"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                          user.accountStatus === "active"
                            ? "bg-green-900/30 text-green-400"
                            : user.accountStatus === "suspended"
                            ? "bg-red-900/30 text-red-400"
                            : "bg-yellow-900/30 text-yellow-400"
                        }`}
                      >
                        {user.accountStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={async () => {
                            try {
                              const response = await adminAPI.getUserDetails(
                                user._id
                              );
                              setSelectedUser(response.data);
                              setShowViewModal(true);
                            } catch (error) {
                              showToast("Failed to load user details", "error");
                            }
                          }}
                          className="p-1.5 hover:bg-[#1a1f3e] rounded text-gray-400"
                          title="View profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEmailModal(true);
                          }}
                          className="p-1.5 hover:bg-[#1a1f3e] rounded text-purple-400"
                          title="Send email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        {user.accountStatus === "active" ? (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowSuspendModal(true);
                            }}
                            className="p-1.5 hover:bg-[#1a1f3e] rounded text-orange-400"
                            title="Suspend user"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user)}
                            className="p-1.5 hover:bg-[#1a1f3e] rounded text-green-400"
                            title="Activate user"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setDeleteConfirm({ show: true, userId: user._id })
                          }
                          className="p-1.5 hover:bg-[#1a1f3e] rounded text-red-400"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="bg-[#0d1230] px-6 py-4 border-t border-[#2a3050]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-300">
                Showing <span className="font-semibold">{users.length}</span> of{" "}
                <span className="font-semibold">{pagination.total}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      currentPage: pagination.currentPage - 1,
                    })
                  }
                  disabled={pagination.currentPage === 1}
                  className="p-2 border border-[#2a3050] rounded hover:bg-[#1a1f3e] disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                {[...Array(Math.min(pagination.pages, 5))].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() =>
                      setPagination({ ...pagination, currentPage: i + 1 })
                    }
                    className={`px-3 py-1 rounded text-sm ${
                      pagination.currentPage === i + 1
                        ? "bg-purple-600 text-white"
                        : "border border-[#2a3050] hover:bg-[#1a1f3e] text-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      currentPage: pagination.currentPage + 1,
                    })
                  }
                  disabled={pagination.currentPage === pagination.pages}
                  className="p-2 border border-[#2a3050] rounded hover:bg-[#1a1f3e] disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Profile Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d1230] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#2a3050]">
              {/* Header */}
              <div className="relative bg-[#0d1230] border-b border-[#2a3050]">
                <div className="px-6 py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {selectedUser.profilePicture ? (
                        <img
                          src={
                            selectedUser.profilePicture.startsWith("http")
                              ? selectedUser.profilePicture
                              : `http://localhost:5000${selectedUser.profilePicture}`
                          }
                          alt={selectedUser.name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-[#2a3050] shadow-md"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                          <span className="text-3xl font-bold text-white">
                            {selectedUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-100">
                          {selectedUser.name}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          {selectedUser.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-3 py-1 bg-[#1a1f3e] text-gray-300 rounded-full text-xs font-semibold capitalize">
                            {selectedUser.role}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              selectedUser.accountStatus === "active"
                                ? "bg-green-900/30 text-green-400"
                                : selectedUser.accountStatus === "suspended"
                                ? "bg-red-900/30 text-red-400"
                                : "bg-yellow-900/30 text-yellow-400"
                            }`}
                          >
                            {selectedUser.accountStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="p-2 hover:bg-[#1a1f3e] rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Account Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1a1f3e] border border-[#2a3050] rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase">
                        Member Since
                      </span>
                    </div>
                    <p className="text-base font-semibold text-gray-100">
                      {new Date(selectedUser.createdAt).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </p>
                  </div>

                  {selectedUser.experience && (
                    <div className="bg-[#1a1f3e] border border-[#2a3050] rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Award className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase">
                          Experience
                        </span>
                      </div>
                      <p className="text-base font-semibold text-gray-100 capitalize">
                        {selectedUser.experience}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bio Section */}
                {selectedUser.bio && (
                  <div className="bg-[#1a1f3e] border border-[#2a3050] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-100 mb-2">
                      About
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {selectedUser.bio}
                    </p>
                  </div>
                )}

                {/* Profile Completion Status */}
                <div className="bg-[#1a1f3e] border border-[#2a3050] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-100">
                      Profile Completion
                    </h3>
                    <span className="text-xl font-bold text-purple-400">
                      {Math.round(
                        ([
                          selectedUser.name && selectedUser.email,
                          selectedUser.bio,
                          selectedUser.experience,
                          selectedUser.programmingLanguages?.length > 0,
                          selectedUser.skills?.length > 0,
                        ].filter(Boolean).length /
                          5) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-[#2a3050] rounded-full h-2 mb-3">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.round(
                          ([
                            selectedUser.name && selectedUser.email,
                            selectedUser.bio,
                            selectedUser.experience,
                            selectedUser.programmingLanguages?.length > 0,
                            selectedUser.skills?.length > 0,
                          ].filter(Boolean).length /
                            5) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Basic Info</span>
                      {selectedUser.name && selectedUser.email ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#2a3050]" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Bio</span>
                      {selectedUser.bio ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#2a3050]" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Experience Level</span>
                      {selectedUser.experience ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#2a3050]" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">
                        Programming Languages
                      </span>
                      {selectedUser.programmingLanguages?.length > 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#2a3050]" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Skills</span>
                      {selectedUser.skills?.length > 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#2a3050]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills & Interests */}
                {selectedUser.programmingLanguages?.length > 0 && (
                  <div className="bg-[#1a1f3e] border border-[#2a3050] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-100 mb-3">
                      Programming Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.programmingLanguages.map(
                        (lang: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-blue-900/30 text-blue-400 border border-blue-500/30 rounded-md text-xs font-medium"
                          >
                            {lang}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {selectedUser.skills?.length > 0 && (
                  <div className="bg-[#1a1f3e] border border-[#2a3050] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-100 mb-3">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-green-900/30 text-green-400 border border-green-500/30 rounded-md text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.interests?.length > 0 && (
                  <div className="bg-[#1a1f3e] border border-[#2a3050] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-100 mb-3">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.interests.map(
                        (interest: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-purple-900/30 text-purple-400 border border-purple-500/30 rounded-md text-xs font-medium"
                          >
                            {interest}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-[#2a3050] bg-[#0d1230] flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Email Modal */}
        {showEmailModal && selectedUser && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d1230] rounded-lg w-full max-w-lg shadow-2xl border border-[#2a3050]">
              <div className="px-6 py-4 border-b border-[#2a3050] flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-100">
                  Send Email to {selectedUser.name}
                </h2>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="p-2 hover:bg-[#1a1f3e] rounded-md"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-100 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={emailFormData.subject}
                    onChange={(e) =>
                      setEmailFormData({
                        ...emailFormData,
                        subject: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Email subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-100 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={emailFormData.message}
                    onChange={(e) =>
                      setEmailFormData({
                        ...emailFormData,
                        message: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={6}
                    placeholder="Email message"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#2a3050] flex justify-end gap-3">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 border border-[#2a3050] rounded-md text-sm font-medium text-gray-300 hover:bg-[#1a1f3e]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {loading ? "Sending..." : "Send Email"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Suspend User Modal */}
        {showSuspendModal && selectedUser && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0d1230] rounded-lg w-full max-w-md shadow-2xl border border-[#2a3050]">
              <div className="px-6 py-4 border-b border-[#2a3050] flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-100">
                  Suspend User
                </h2>
                <button
                  onClick={() => setShowSuspendModal(false)}
                  className="p-2 hover:bg-[#1a1f3e] rounded-md"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-400">
                  Are you sure you want to suspend{" "}
                  <strong className="text-gray-200">{selectedUser.name}</strong>
                  ? They will be notified via email.
                </p>

                <div>
                  <label className="block text-sm font-semibold text-gray-100 mb-2">
                    Reason (optional)
                  </label>
                  <textarea
                    value={suspendFormData.reason}
                    onChange={(e) =>
                      setSuspendFormData({ reason: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Reason for suspension..."
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#2a3050] flex justify-end gap-3">
                <button
                  onClick={() => setShowSuspendModal(false)}
                  className="px-4 py-2 border border-[#2a3050] rounded-md text-sm font-medium text-gray-300 hover:bg-[#1a1f3e]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspendUser}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  {loading ? "Suspending..." : "Suspend User"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteConfirm.show}
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteConfirm({ show: false, userId: null })}
          confirmText="Delete"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      </div>
    </div>
  );
}
