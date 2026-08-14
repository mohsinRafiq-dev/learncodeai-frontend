import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader,
  Trash2,
  Filter,
} from "lucide-react";
import { STORAGE_KEYS } from "../../../constants";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Certificate {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
  };
  certificateNumber: string;
  finalScore: number;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: string;
  rejectionReason?: string;
}

export default function CertificateApproval() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const LIMIT = 10;

  const loadCertificates = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      const url = statusFilter 
        ? `${API_BASE_URL}/admin/certificates?page=${page}&limit=${LIMIT}&status=${statusFilter}`
        : `${API_BASE_URL}/admin/certificates?page=${page}&limit=${LIMIT}`;
      const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token || ""}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();

      const data = JSON.parse(text);

      if (data.success) {
        setCertificates(data.data);
        setTotal(data.total);
      } else {
        setError(data.message || "Failed to load certificates");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const approveCertificate = async (certificateId: string) => {
    try {
      setApprovingId(certificateId);
      const response = await fetch(
        `${API_BASE_URL}/admin/certificates/${certificateId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ""
            }`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCertificates(
          certificates.filter((cert) => cert._id !== certificateId)
        );
        setTotal(total - 1);
      } else {
        alert(data.message || "Failed to approve certificate");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setApprovingId(null);
    }
  };

  const rejectCertificate = async (certificateId: string) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      setRejectingId(certificateId);
      const response = await fetch(
        `${API_BASE_URL}/admin/certificates/${certificateId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ""
            }`,
          },
          body: JSON.stringify({ rejectionReason: rejectionReason.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCertificates(
          certificates.filter((cert) => cert._id !== certificateId)
        );
        setTotal(total - 1);
        setRejectionReason("");
        setExpandedId(null);
      } else {
        alert(data.message || "Failed to reject certificate");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setRejectingId(null);
    }
  };

  const deleteCertificate = async (certificateId: string) => {
    if (!window.confirm("Are you sure you want to delete this certificate? This action cannot be undone.")) return;
    
    try {
      setDeletingId(certificateId);
      const response = await fetch(
        `${API_BASE_URL}/admin/certificates/${certificateId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ""}`,
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        setCertificates(certificates.filter((cert) => cert._id !== certificateId));
        setTotal(total - 1);
        setExpandedId(null);
      } else {
        alert(data.message || "Failed to delete certificate");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 bg-[#0d1230] border border-[#2a3050] rounded-lg shadow">
      <div className="text-sm text-gray-400 mb-1">
        Admin Panel / Certificates
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">
          Certificate Management
        </h2>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1a1f3e] border border-[#2a3050] text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Certificates</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader className="animate-spin text-purple-500" size={32} />
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {total === 0
            ? "No pending certificates to approve"
            : "No certificates found"}
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="border border-[#2a3050] rounded-lg overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-shadow"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === cert._id ? null : cert._id)
                }
                className="w-full px-6 py-4 flex items-center justify-between bg-[#1a1f3e] hover:bg-[#252a4a] transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <Clock className="text-yellow-400" size={20} />
                  <div>
                    <p className="font-semibold text-gray-100">
                      {cert.user.name}
                    </p>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      {cert.course.title} • Score: {cert.finalScore}%
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        cert.approvalStatus === 'approved' ? 'bg-green-900/30 text-green-400' :
                        cert.approvalStatus === 'rejected' ? 'bg-red-900/30 text-red-400' :
                        'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {cert.approvalStatus.charAt(0).toUpperCase() + cert.approvalStatus.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-200">
                      {cert.certificateNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(cert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {expandedId === cert._id ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </button>

              {expandedId === cert._id && (
                <div className="px-6 py-4 bg-[#0d1230] border-t border-[#2a3050]">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">User Email</p>
                      <p className="font-medium text-gray-200">
                        {cert.user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Final Score</p>
                      <p className="font-medium text-gray-200">
                        {cert.finalScore}%
                      </p>
                    </div>
                  </div>

                  {expandedId === cert._id && rejectingId === cert._id && (
                    <div className="mb-4 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Rejection Reason *
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please provide a reason for rejection"
                        className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    {rejectingId === cert._id ? (
                      <>
                        <button
                          onClick={() => rejectCertificate(cert._id)}
                          disabled={!rejectionReason.trim()}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-600 transition-colors font-medium"
                        >
                          <XCircle size={18} />
                          Confirm Rejection
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason("");
                          }}
                          className="flex-1 px-4 py-2 bg-[#1a1f3e] border border-[#2a3050] text-gray-200 rounded-lg hover:bg-[#252a4a] transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => approveCertificate(cert._id)}
                          disabled={approvingId === cert._id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 transition-colors font-medium"
                        >
                          {approvingId === cert._id ? (
                            <Loader className="animate-spin" size={18} />
                          ) : (
                            <CheckCircle size={18} />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(cert._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors font-medium"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteCertificate(cert._id)}
                      disabled={deletingId === cert._id}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1a1f3e] border border-[#2a3050] text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                    >
                      {deletingId === cert._id ? (
                        <Loader className="animate-spin" size={18} />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#1a1f3e] border border-[#2a3050] text-gray-200 rounded-lg hover:bg-[#252a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-300 font-medium">
              Page {page} of {Math.ceil(total / LIMIT)}
            </span>
            <button
              onClick={() =>
                setPage(Math.min(Math.ceil(total / LIMIT), page + 1))
              }
              disabled={page >= Math.ceil(total / LIMIT)}
              className="px-4 py-2 bg-[#1a1f3e] border border-[#2a3050] text-gray-200 rounded-lg hover:bg-[#252a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
