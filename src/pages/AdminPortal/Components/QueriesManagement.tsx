import React, { useState, useEffect } from "react";
import {
  Search,
  Mail,
  Eye,
  Calendar,
  User,
  Users,
  MessageSquare,
} from "lucide-react";
import { adminAPI } from "../../../services/adminAPI";
import { useToast } from "../../../contexts/ToastContext";
import { contactAPI } from "../../../services/contactAPI";

export default function QueriesManagement() {
  const [activeTab, setActiveTab] = useState("contacts");
  const [contacts, setContacts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [replyForm, setReplyForm] = useState({
    subject: "",
    message: "",
  });
  const [sendingReply, setSendingReply] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (activeTab === "contacts") {
      fetchContacts();
    } else {
      fetchSubscriptions();
    }
  }, [activeTab, searchTerm]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.getAllContacts({ search: searchTerm });
      setContacts(response.data.data?.contacts || []);
    } catch (error) {
      showToast("Failed to load contacts", "error");
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getNewsletterSubscriptions({
        search: searchTerm,
      });
      setSubscriptions(response.data?.subscriptions || []);
    } catch (error) {
      showToast("Failed to load newsletter subscriptions", "error");
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (
      !selectedContact ||
      !replyForm.subject.trim() ||
      !replyForm.message.trim()
    ) {
      showToast("Please fill in both subject and message", "error");
      return;
    }

    try {
      setSendingReply(true);
      await contactAPI.replyToContact(selectedContact._id, {
        subject: replyForm.subject,
        message: replyForm.message,
      });

      showToast("Reply sent successfully!", "success");
      setShowReplyModal(false);
      setReplyForm({ subject: "", message: "" });
      setSelectedContact(null);
      fetchContacts(); // Refresh the contacts list
    } catch (error) {
      showToast("Failed to send reply", "error");
      console.error("Error sending reply:", error);
    } finally {
      setSendingReply(false);
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            Queries Management
          </h1>
          <p className="text-gray-400 mt-1">
            Manage contact forms and newsletter subscriptions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0d1230] border-b border-[#2a3050]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === "contacts"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:border-[#2a3050]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Contact Forms
          </button>
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === "subscriptions"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:border-[#2a3050]"
            }`}
          >
            <Users className="w-4 h-4" />
            Newsletter Subscriptions
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#0d1230] p-4 rounded-lg border border-[#2a3050]">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder={
              activeTab === "contacts"
                ? "Search contacts..."
                : "Search subscriptions..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === "contacts" ? (
        <div className="bg-[#0d1230] rounded-lg border border-[#2a3050] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1a1f3e] border-b border-[#2a3050]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">
                    NAME
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">
                    EMAIL
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">
                    SUBJECT
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">
                    DATE
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">
                    STATUS
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      Loading contacts...
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No contacts found
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr
                      key={contact._id}
                      className="border-b border-[#2a3050] hover:bg-[#1a1f3e]"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-100 font-medium">
                          {contact.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-400">
                          {contact.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-200 max-w-xs truncate">
                          {contact.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-400 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-medium ${
                            contact.status === "replied"
                              ? "bg-green-900/30 text-green-400"
                              : contact.status === "in-progress"
                              ? "bg-yellow-900/30 text-yellow-400"
                              : "bg-gray-700/30 text-gray-400"
                          }`}
                        >
                          {contact.status || "new"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowViewModal(true);
                            }}
                            className="p-1.5 hover:bg-[#1a1f3e] rounded text-purple-400"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setReplyForm({
                                subject: `Re: ${contact.subject}`,
                                message: "",
                              });
                              setShowReplyModal(true);
                            }}
                            className="p-1.5 hover:bg-[#1a1f3e] rounded text-green-400"
                            title="Reply via email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#0d1230] rounded-lg border border-[#2a3050] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1a1f3e] border-b border-[#2a3050]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">
                    EMAIL
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">
                    SUBSCRIBED DATE
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">
                    STATUS
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">
                    IP ADDRESS
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((subscription) => (
                    <tr
                      key={subscription._id}
                      className="border-b border-[#2a3050] hover:bg-[#1a1f3e]"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-100 font-medium">
                          {subscription.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-400 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(
                            subscription.subscribedAt
                          ).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-medium ${
                            subscription.isActive
                              ? "bg-green-900/30 text-green-400"
                              : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          {subscription.isActive ? "Active" : "Unsubscribed"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-400">
                          {subscription.ipAddress || "-"}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Contact Modal */}
      {showViewModal && selectedContact && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-100">
                Contact Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Name
                </label>
                <p className="text-gray-200">{selectedContact.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-gray-200">{selectedContact.email}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Subject
                </label>
                <p className="text-gray-200">{selectedContact.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Message
                </label>
                <div className="bg-[#1a1f3e] p-4 rounded-lg border border-[#2a3050]">
                  <p className="text-gray-200 whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Submitted On
                </label>
                <p className="text-gray-400">
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-[#2a3050] text-gray-300 rounded-lg hover:bg-[#1a1f3e]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setReplyForm({
                    subject: `Re: ${selectedContact.subject}`,
                    message: "",
                  });
                  setShowReplyModal(true);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-100">
                Reply to {selectedContact.fullName}
              </h2>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  To
                </label>
                <p className="text-gray-200">{selectedContact.email}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={replyForm.subject}
                  onChange={(e) =>
                    setReplyForm((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={replyForm.message}
                  onChange={(e) =>
                    setReplyForm((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  rows={8}
                  className="w-full px-4 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Type your reply here..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowReplyModal(false)}
                disabled={sendingReply}
                className="px-4 py-2 border border-[#2a3050] text-gray-300 rounded-lg hover:bg-[#1a1f3e] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={
                  sendingReply ||
                  !replyForm.subject.trim() ||
                  !replyForm.message.trim()
                }
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {sendingReply ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
