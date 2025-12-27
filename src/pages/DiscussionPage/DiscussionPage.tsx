import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MessageSquare,
  Search,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Eye,
  Clock,
  CheckCircle2,
  Pin,
  Lock,
  Code,
  ChevronRight,
  X,
  Send,
  Edit2,
  Trash2,
  Flag,
  Check,
  Copy,
  MoreVertical,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../contexts/ToastContext";
import discussionAPI, {
  type Discussion,
  type Comment,
  type CodeSnippet,
  type DiscussionFilters,
} from "../../services/discussionAPI";

// Topic configuration
const TOPICS = [
  {
    value: "python",
    label: "Python",
    color: "bg-yellow-500/20 text-yellow-400",
  },
  {
    value: "javascript",
    label: "JavaScript",
    color: "bg-yellow-500/20 text-yellow-300",
  },
  { value: "cpp", label: "C++", color: "bg-blue-500/20 text-blue-400" },
  { value: "java", label: "Java", color: "bg-orange-500/20 text-orange-400" },
  {
    value: "web-development",
    label: "Web Dev",
    color: "bg-purple-500/20 text-purple-400",
  },
  {
    value: "data-structures",
    label: "Data Structures",
    color: "bg-green-500/20 text-green-400",
  },
  {
    value: "algorithms",
    label: "Algorithms",
    color: "bg-cyan-500/20 text-cyan-400",
  },
  {
    value: "databases",
    label: "Databases",
    color: "bg-pink-500/20 text-pink-400",
  },
  { value: "general", label: "General", color: "bg-gray-500/20 text-gray-400" },
  {
    value: "career",
    label: "Career",
    color: "bg-indigo-500/20 text-indigo-400",
  },
  {
    value: "project-help",
    label: "Project Help",
    color: "bg-rose-500/20 text-rose-400",
  },
  {
    value: "code-review",
    label: "Code Review",
    color: "bg-teal-500/20 text-teal-400",
  },
];

const DISCUSSION_TYPES = [
  { value: "question", label: "Question" },
  { value: "discussion", label: "Discussion" },
  { value: "tutorial", label: "Tutorial" },
];

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "harassment", label: "Harassment" },
  { value: "off-topic", label: "Off-topic" },
  { value: "other", label: "Other" },
];

// Code Block Component with Syntax Highlighting
const CodeBlock: React.FC<{
  code: string;
  language: string;
  filename?: string;
}> = ({ code, language, filename }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-[#2a3050]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1f3e]">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-gray-400">
            {filename || language.toUpperCase()}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 bg-[#0a0e27] overflow-x-auto">
        <code className="text-sm font-mono text-gray-300 whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
};

// Code Editor for creating snippets
const CodeEditor: React.FC<{
  snippets: CodeSnippet[];
  onChange: (snippets: CodeSnippet[]) => void;
}> = ({ snippets, onChange }) => {
  const [showEditor, setShowEditor] = useState(false);
  const [currentSnippet, setCurrentSnippet] = useState<CodeSnippet>({
    language: "javascript",
    code: "",
    filename: "",
  });

  const addSnippet = () => {
    if (currentSnippet.code.trim()) {
      onChange([...snippets, currentSnippet]);
      setCurrentSnippet({ language: "javascript", code: "", filename: "" });
      setShowEditor(false);
    }
  };

  const removeSnippet = (index: number) => {
    onChange(snippets.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {snippets.map((snippet, index) => (
        <div key={index} className="relative">
          <button
            onClick={() => removeSnippet(index)}
            className="absolute top-2 right-2 z-10 p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <CodeBlock
            code={snippet.code}
            language={snippet.language}
            filename={snippet.filename}
          />
        </div>
      ))}

      {showEditor ? (
        <div className="bg-[#1a1f3e] border border-[#2a3050] rounded-lg p-4 space-y-3">
          <div className="flex gap-3">
            <select
              value={currentSnippet.language}
              onChange={(e) =>
                setCurrentSnippet({
                  ...currentSnippet,
                  language: e.target.value,
                })
              }
              className="px-3 py-2 bg-[#0d1230] border border-[#2a3050] rounded-lg text-gray-200 text-sm"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash</option>
            </select>
            <input
              type="text"
              placeholder="Filename (optional)"
              value={currentSnippet.filename}
              onChange={(e) =>
                setCurrentSnippet({
                  ...currentSnippet,
                  filename: e.target.value,
                })
              }
              className="flex-1 px-3 py-2 bg-[#0d1230] border border-[#2a3050] rounded-lg text-gray-200 text-sm placeholder-gray-500"
            />
          </div>
          <textarea
            value={currentSnippet.code}
            onChange={(e) =>
              setCurrentSnippet({ ...currentSnippet, code: e.target.value })
            }
            placeholder="Paste your code here..."
            rows={8}
            className="w-full px-3 py-2 bg-[#0d1230] border border-[#2a3050] rounded-lg text-gray-200 font-mono text-sm placeholder-gray-500 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowEditor(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addSnippet}
              disabled={!currentSnippet.code.trim()}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
            >
              Add Code
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-[#2a3050] rounded-lg text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
        >
          <Code className="w-4 h-4" />
          Add Code Snippet
        </button>
      )}
    </div>
  );
};

// Vote Button Component
const VoteButton: React.FC<{
  direction: "up" | "down";
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ direction, active, onClick, disabled }) => {
  const Icon = direction === "up" ? ThumbsUp : ThumbsDown;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all ${
        active
          ? direction === "up"
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
          : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1f3e]"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};

// Report Modal
const ReportModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => void;
  isSubmitting: boolean;
}> = ({ show, onClose, onSubmit, isSubmitting }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1230] border border-[#2a3050] rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-[#2a3050]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Flag className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Report Content</h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for report *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200"
            >
              <option value="">Select a reason</option>
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context..."
              rows={3}
              className="w-full px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 placeholder-gray-500 resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-[#2a3050] flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-[#1a1f3e] text-gray-300 rounded-lg font-medium hover:bg-[#252b4a] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason, description)}
            disabled={!reason || isSubmitting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Discussion Modal
const CreateDiscussionModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}> = ({ show, onClose, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("general");
  const [type, setType] = useState("question");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>([]);

  const handleAddTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag) && tags.length < 5) {
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const handleSubmit = () => {
    onSubmit({
      title,
      content,
      topic,
      type,
      tags,
      codeSnippets,
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#0d1230] border border-[#2a3050] rounded-2xl w-full max-w-3xl my-8">
        <div className="p-6 border-b border-[#2a3050]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Start a Discussion
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question or discussion topic?"
              className="w-full px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Type and Topic */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200"
              >
                {DISCUSSION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Topic *
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200"
              >
                {TOPICS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your question or start your discussion..."
              rows={6}
              className="w-full px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Code Snippets */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Code Snippets
            </label>
            <CodeEditor snippets={codeSnippets} onChange={setCodeSnippets} />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (up to 5)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#1a1f3e] border border-[#2a3050] rounded-full text-sm text-gray-300 flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 placeholder-gray-500 text-sm"
              />
              <button
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                className="px-4 py-2 bg-[#2a3050] text-gray-300 rounded-lg hover:bg-[#3a4060] transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#2a3050] flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-[#1a1f3e] text-gray-300 rounded-lg font-medium hover:bg-[#252b4a] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || isSubmitting}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-cyan-700 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Discussion"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Discussion Card Component
const DiscussionCard: React.FC<{
  discussion: Discussion;
  onClick: () => void;
}> = ({ discussion, onClick }) => {
  const topicConfig = TOPICS.find((t) => t.value === discussion.topic);

  return (
    <div
      onClick={onClick}
      className="bg-[#0d1230] border border-[#2a3050] rounded-xl p-5 hover:border-purple-500/50 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        {/* Vote Score */}
        <div className="flex flex-col items-center gap-1 min-w-[50px]">
          <span
            className={`text-xl font-bold ${
              discussion.voteScore > 0
                ? "text-green-400"
                : discussion.voteScore < 0
                ? "text-red-400"
                : "text-gray-500"
            }`}
          >
            {discussion.voteScore}
          </span>
          <span className="text-xs text-gray-500">votes</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {discussion.isPinned && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
            {discussion.isLocked && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Locked
              </span>
            )}
            {discussion.status === "answered" && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Answered
              </span>
            )}
            {topicConfig && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${topicConfig.color}`}
              >
                {topicConfig.label}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors mb-2 line-clamp-2">
            {discussion.title}
          </h3>

          {/* Preview */}
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {discussion.content}
          </p>

          {/* Tags */}
          {discussion.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {discussion.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#1a1f3e] text-gray-400 text-xs rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {discussion.commentCount} answers
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {discussion.viewCount} views
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">
                {discussion.author.username}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(discussion.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
      </div>
    </div>
  );
};

// Comment Component
const CommentCard: React.FC<{
  comment: Comment;
  discussionId: string;
  discussionAuthorId: string;
  currentUserId?: string;
  onVote: (commentId: string, voteType: "up" | "down" | "none") => void;
  onAccept: (commentId: string) => void;
  onReport: (commentId: string) => void;
  onEdit: (
    commentId: string,
    content: string,
    codeSnippets: CodeSnippet[]
  ) => void;
  onDelete: (commentId: string) => void;
}> = ({
  comment,
  discussionAuthorId,
  currentUserId,
  onVote,
  onAccept,
  onReport,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editSnippets, setEditSnippets] = useState<CodeSnippet[]>(
    comment.codeSnippets
  );

  const isAuthor = currentUserId === comment.author._id;
  const isDiscussionAuthor = currentUserId === discussionAuthorId;
  const userVote = comment.upvotes.includes(currentUserId || "")
    ? "up"
    : comment.downvotes.includes(currentUserId || "")
    ? "down"
    : null;

  const handleSaveEdit = () => {
    onEdit(comment._id, editContent, editSnippets);
    setIsEditing(false);
  };

  return (
    <div
      className={`bg-[#0d1230] border rounded-xl p-5 ${
        comment.isAcceptedAnswer
          ? "border-green-500/50 bg-green-900/10"
          : "border-[#2a3050]"
      }`}
    >
      {comment.isAcceptedAnswer && (
        <div className="flex items-center gap-2 text-green-400 mb-3">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Accepted Answer</span>
        </div>
      )}

      <div className="flex gap-4">
        {/* Voting */}
        <div className="flex flex-col items-center gap-1">
          <VoteButton
            direction="up"
            active={userVote === "up"}
            onClick={() =>
              onVote(comment._id, userVote === "up" ? "none" : "up")
            }
            disabled={!currentUserId}
          />
          <span
            className={`text-lg font-bold ${
              comment.voteScore > 0
                ? "text-green-400"
                : comment.voteScore < 0
                ? "text-red-400"
                : "text-gray-500"
            }`}
          >
            {comment.voteScore}
          </span>
          <VoteButton
            direction="down"
            active={userVote === "down"}
            onClick={() =>
              onVote(comment._id, userVote === "down" ? "none" : "down")
            }
            disabled={!currentUserId}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 resize-none"
                rows={4}
              />
              <CodeEditor snippets={editSnippets} onChange={setEditSnippets} />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-200 whitespace-pre-wrap mb-3">
                {comment.content}
              </p>
              {comment.codeSnippets.map((snippet, i) => (
                <CodeBlock
                  key={i}
                  code={snippet.code}
                  language={snippet.language}
                  filename={snippet.filename}
                />
              ))}
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2a3050]">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">{comment.author.username}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
              {comment.isEdited && (
                <span className="text-gray-600 text-xs">(edited)</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isDiscussionAuthor && !comment.isAcceptedAnswer && (
                <button
                  onClick={() => onAccept(comment._id)}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-[#1a1f3e] transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-[#1a1f3e] border border-[#2a3050] rounded-lg shadow-xl z-10 py-1 min-w-[120px]">
                    {isAuthor && (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#2a3050] flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDelete(comment._id);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#2a3050] flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}
                    {!isAuthor && currentUserId && (
                      <button
                        onClick={() => {
                          onReport(comment._id);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-yellow-400 hover:bg-[#2a3050] flex items-center gap-2"
                      >
                        <Flag className="w-4 h-4" />
                        Report
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main DiscussionPage Component
const DiscussionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  // State
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscussion, setSelectedDiscussion] =
    useState<Discussion | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: "discussion" | "comment";
    id: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [filters, setFilters] = useState<DiscussionFilters>({
    topic: searchParams.get("topic") || "",
    sortBy: (searchParams.get("sortBy") as any) || "newest",
    search: searchParams.get("search") || "",
  });
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // New comment state
  const [newComment, setNewComment] = useState("");
  const [newCommentSnippets, setNewCommentSnippets] = useState<CodeSnippet[]>(
    []
  );

  // Load discussions
  const loadDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await discussionAPI.getDiscussions({
        ...filters,
        limit: 20,
      });
      setDiscussions(response.data?.discussions || []);
    } catch (error) {
      console.error("Error loading discussions:", error);
      showToast("Failed to load discussions", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    if (!selectedDiscussion) {
      loadDiscussions();
    }
  }, [loadDiscussions, selectedDiscussion]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.topic) params.set("topic", filters.topic);
    if (filters.sortBy && filters.sortBy !== "newest")
      params.set("sortBy", filters.sortBy);
    if (filters.search) params.set("search", filters.search);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Load single discussion
  const loadDiscussion = async (discussionId: string) => {
    try {
      const response = await discussionAPI.getDiscussion(discussionId);
      if (response.success) {
        setSelectedDiscussion(response.data);
      }
    } catch (error) {
      console.error("Error loading discussion:", error);
      showToast("Failed to load discussion", "error");
    }
  };

  // Handle search
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  // Create discussion
  const handleCreateDiscussion = async (data: any) => {
    if (!isAuthenticated) {
      showToast("Please login to create discussions", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await discussionAPI.createDiscussion(data);
      if (response.success) {
        showToast("Discussion created successfully!", "success");
        setShowCreateModal(false);
        loadDiscussions();
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to create discussion",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vote on discussion
  const handleVoteDiscussion = async (voteType: "up" | "down" | "none") => {
    if (!isAuthenticated || !selectedDiscussion) {
      showToast("Please login to vote", "error");
      return;
    }

    try {
      const response = await discussionAPI.voteDiscussion(
        selectedDiscussion._id,
        voteType
      );
      if (response.success) {
        loadDiscussion(selectedDiscussion._id);
      }
    } catch (error) {
      showToast("Failed to vote", "error");
    }
  };

  // Vote on comment
  const handleVoteComment = async (
    commentId: string,
    voteType: "up" | "down" | "none"
  ) => {
    if (!isAuthenticated || !selectedDiscussion) {
      showToast("Please login to vote", "error");
      return;
    }

    try {
      await discussionAPI.voteComment(
        selectedDiscussion._id,
        commentId,
        voteType
      );
      loadDiscussion(selectedDiscussion._id);
    } catch (error) {
      showToast("Failed to vote", "error");
    }
  };

  // Accept answer
  const handleAcceptAnswer = async (commentId: string) => {
    if (!selectedDiscussion) return;

    try {
      await discussionAPI.acceptAnswer(selectedDiscussion._id, commentId);
      showToast("Answer accepted!", "success");
      loadDiscussion(selectedDiscussion._id);
    } catch (error) {
      showToast("Failed to accept answer", "error");
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!isAuthenticated || !selectedDiscussion) {
      showToast("Please login to comment", "error");
      return;
    }

    if (!newComment.trim()) {
      showToast("Please enter a comment", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await discussionAPI.addComment(selectedDiscussion._id, {
        content: newComment,
        codeSnippets: newCommentSnippets,
      });
      showToast("Comment added!", "success");
      setNewComment("");
      setNewCommentSnippets([]);
      loadDiscussion(selectedDiscussion._id);
    } catch (error) {
      showToast("Failed to add comment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit comment
  const handleEditComment = async (
    commentId: string,
    content: string,
    codeSnippets: CodeSnippet[]
  ) => {
    if (!selectedDiscussion) return;

    try {
      await discussionAPI.editComment(selectedDiscussion._id, commentId, {
        content,
        codeSnippets,
      });
      showToast("Comment updated!", "success");
      loadDiscussion(selectedDiscussion._id);
    } catch (error) {
      showToast("Failed to update comment", "error");
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!selectedDiscussion) return;

    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await discussionAPI.deleteComment(selectedDiscussion._id, commentId);
      showToast("Comment deleted!", "success");
      loadDiscussion(selectedDiscussion._id);
    } catch (error) {
      showToast("Failed to delete comment", "error");
    }
  };

  // Report content
  const handleReport = async (reason: string, description: string) => {
    if (!reportTarget || !selectedDiscussion) return;

    try {
      setIsSubmitting(true);
      if (reportTarget.type === "comment") {
        await discussionAPI.reportComment(
          selectedDiscussion._id,
          reportTarget.id,
          reason,
          description
        );
      } else {
        await discussionAPI.reportDiscussion(
          selectedDiscussion._id,
          reason,
          description
        );
      }
      showToast("Report submitted!", "success");
      setShowReportModal(false);
      setReportTarget(null);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to submit report",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render discussion detail view
  if (selectedDiscussion) {
    const topicConfig = TOPICS.find(
      (t) => t.value === selectedDiscussion.topic
    );
    const userVote = selectedDiscussion.upvotes.includes(user?._id || "")
      ? "up"
      : selectedDiscussion.downvotes.includes(user?._id || "")
      ? "down"
      : null;

    return (
      <div className="min-h-screen bg-[#0a0e27] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setSelectedDiscussion(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to Discussions
          </button>

          {/* Discussion Content */}
          <div className="bg-[#0d1230] border border-[#2a3050] rounded-2xl p-6 mb-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {selectedDiscussion.isPinned && (
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                  <Pin className="w-3 h-3" />
                  Pinned
                </span>
              )}
              {selectedDiscussion.isLocked && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Locked
                </span>
              )}
              {selectedDiscussion.status === "answered" && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Answered
                </span>
              )}
              {topicConfig && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${topicConfig.color}`}
                >
                  {topicConfig.label}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">
              {selectedDiscussion.title}
            </h1>

            <div className="flex gap-4">
              {/* Voting */}
              <div className="flex flex-col items-center gap-1">
                <VoteButton
                  direction="up"
                  active={userVote === "up"}
                  onClick={() =>
                    handleVoteDiscussion(userVote === "up" ? "none" : "up")
                  }
                  disabled={!isAuthenticated}
                />
                <span
                  className={`text-xl font-bold ${
                    selectedDiscussion.voteScore > 0
                      ? "text-green-400"
                      : selectedDiscussion.voteScore < 0
                      ? "text-red-400"
                      : "text-gray-500"
                  }`}
                >
                  {selectedDiscussion.voteScore}
                </span>
                <VoteButton
                  direction="down"
                  active={userVote === "down"}
                  onClick={() =>
                    handleVoteDiscussion(userVote === "down" ? "none" : "down")
                  }
                  disabled={!isAuthenticated}
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-gray-200 whitespace-pre-wrap mb-4">
                  {selectedDiscussion.content}
                </p>

                {selectedDiscussion.codeSnippets.map((snippet, i) => (
                  <CodeBlock
                    key={i}
                    code={snippet.code}
                    language={snippet.language}
                    filename={snippet.filename}
                  />
                ))}

                {/* Tags */}
                {selectedDiscussion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedDiscussion.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-[#1a1f3e] text-gray-400 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2a3050]">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedDiscussion.viewCount} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {selectedDiscussion.comments.length} answers
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">
                      Asked by{" "}
                      <strong>{selectedDiscussion.author.username}</strong>
                    </span>
                    <span className="text-gray-500 text-sm">
                      {new Date(
                        selectedDiscussion.createdAt
                      ).toLocaleDateString()}
                    </span>
                    {isAuthenticated &&
                      user?._id !== selectedDiscussion.author._id && (
                        <button
                          onClick={() => {
                            setReportTarget({
                              type: "discussion",
                              id: selectedDiscussion._id,
                            });
                            setShowReportModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-yellow-400 rounded-lg hover:bg-[#1a1f3e] transition-colors"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {selectedDiscussion.comments.length} Answer
              {selectedDiscussion.comments.length !== 1 ? "s" : ""}
            </h2>

            <div className="space-y-4">
              {selectedDiscussion.comments.map((comment) => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  discussionId={selectedDiscussion._id}
                  discussionAuthorId={selectedDiscussion.author._id}
                  currentUserId={user?._id}
                  onVote={handleVoteComment}
                  onAccept={handleAcceptAnswer}
                  onReport={(commentId) => {
                    setReportTarget({ type: "comment", id: commentId });
                    setShowReportModal(true);
                  }}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          </div>

          {/* Add Answer */}
          {!selectedDiscussion.isLocked && (
            <div className="bg-[#0d1230] border border-[#2a3050] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Your Answer</h3>

              {isAuthenticated ? (
                <div className="space-y-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your answer..."
                    rows={6}
                    className="w-full px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 placeholder-gray-500 resize-none focus:ring-2 focus:ring-purple-500"
                  />

                  <CodeEditor
                    snippets={newCommentSnippets}
                    onChange={setNewCommentSnippets}
                  />

                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-cyan-700 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    {isSubmitting ? "Posting..." : "Post Your Answer"}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">
                    Please sign in to post an answer
                  </p>
                  <button
                    onClick={() => navigate("/signin")}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedDiscussion.isLocked && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
              <Lock className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">
                This discussion is locked and not accepting new answers.
              </p>
            </div>
          )}
        </div>

        {/* Report Modal */}
        <ReportModal
          show={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setReportTarget(null);
          }}
          onSubmit={handleReport}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  // Render discussion list
  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Hero Section */}
      <div className="relative min-h-[60vh] overflow-hidden bg-[#0a0e27] flex items-center">
        {/* Matrix Rain */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="absolute text-[#00e676] font-mono text-xs hidden md:block"
              style={{
                left: `${i * 8.3}%`,
                animation: `matrix-fall-optimized ${
                  3 + Math.random() * 2
                }s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              {Array.from({ length: 15 }, () =>
                String.fromCharCode(33 + Math.floor(Math.random() * 94))
              ).join("\n")}
            </div>
          ))}
        </div>

        {/* Circuit Pattern */}
        <div className="absolute inset-0 circuit-pattern"></div>

        {/* Glowing Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#00b4d8] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse delay-1000"></div>

        {/* Floating Code Symbols */}
        <div className="hidden lg:block absolute left-[8%] top-[20%] animate-float">
          <div className="terminal-window p-4 backdrop-blur-xl">
            <MessageSquare className="w-6 h-6 text-[#00b4d8]" />
          </div>
        </div>
        <div className="hidden lg:block absolute right-[8%] top-[25%] animate-float delay-300">
          <div className="terminal-window p-4 backdrop-blur-xl">
            <Code className="w-6 h-6 text-[#8b5cf6]" />
          </div>
        </div>
        <div className="hidden lg:block absolute left-[12%] bottom-[25%] animate-float delay-500">
          <div className="terminal-window p-4 backdrop-blur-xl">
            <ThumbsUp className="w-6 h-6 text-[#00e676]" />
          </div>
        </div>
        <div className="hidden lg:block absolute right-[12%] bottom-[30%] animate-float delay-700">
          <div className="terminal-window p-4 backdrop-blur-xl">
            <CheckCircle2 className="w-6 h-6 text-[#e91e63]" />
          </div>
        </div>

        {/* Scanline Effect */}
        <div className="scanline-effect absolute inset-0 pointer-events-none"></div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Terminal Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 neon-border-cyan backdrop-blur-xl bg-[#1a1f3a]/50 rounded-lg shadow-lg mb-6">
            <span className="text-[#00b4d8] font-mono text-sm animate-pulse">
              ●
            </span>
            <span className="text-[#00b4d8] font-mono text-sm font-medium">
              Community Forum
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-mono mb-6">
            <span className="text-[#6272a4]">{"/* "}</span>
            <span className="text-[#00b4d8]">Ask</span>
            <span className="text-white">.</span>
            <span className="text-[#8b5cf6]">Share</span>
            <span className="text-white">.</span>
            <span className="text-[#00e676]">Learn</span>
            <span className="text-[#6272a4]">{" */"}</span>
          </h1>

          {/* Subtitle */}
          <div className="max-w-3xl mx-auto space-y-2 mb-8">
            <p className="text-[#6272a4] font-mono text-base sm:text-lg">
              <span className="text-[#00b4d8]">//</span> Ask questions and get
              expert answers
            </p>
            <p className="text-[#6272a4] font-mono text-base sm:text-lg">
              <span className="text-[#00b4d8]">//</span> Share code snippets
              with syntax highlighting
            </p>
            <p className="text-[#6272a4] font-mono text-base sm:text-lg">
              <span className="text-[#00b4d8]">//</span> Connect with learners
              worldwide
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <div className="terminal-window p-4 backdrop-blur-xl animate-pulse-glow">
              <div className="text-3xl sm:text-4xl font-bold neon-text-cyan font-mono">
                <MessageSquare className="w-8 h-8 inline" />
              </div>
              <div className="text-[#6272a4] text-xs sm:text-sm font-mono mt-1">
                {"Discussions"}
              </div>
            </div>
            <div className="terminal-window p-4 backdrop-blur-xl animate-pulse-glow delay-300">
              <div className="text-3xl sm:text-4xl font-bold neon-text-purple font-mono">
                <Code className="w-8 h-8 inline" />
              </div>
              <div className="text-[#6272a4] text-xs sm:text-sm font-mono mt-1">
                {"Code Sharing"}
              </div>
            </div>
            <div className="terminal-window p-4 backdrop-blur-xl animate-pulse-glow delay-500">
              <div className="text-3xl sm:text-4xl font-bold neon-text-green font-mono">
                <ThumbsUp className="w-8 h-8 inline" />
              </div>
              <div className="text-[#6272a4] text-xs sm:text-sm font-mono mt-1">
                {"Community"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search discussions..."
                className="w-full pl-12 pr-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={filters.topic}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, topic: e.target.value }))
              }
              className="px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200"
            >
              <option value="">All Topics</option>
              {TOPICS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as any,
                }))
              }
              className="px-4 py-3 bg-[#1a1f3e] border border-[#2a3050] rounded-lg text-gray-200"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="unanswered">Unanswered</option>
            </select>
          </div>

          {/* Create Button */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                showToast("Please login to create discussions", "error");
                navigate("/signin");
                return;
              }
              setShowCreateModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-cyan-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-5 h-5" />
            Ask Question
          </button>
        </div>

        {/* Topic Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, topic: "" }))}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !filters.topic
                ? "bg-purple-600 text-white"
                : "bg-[#1a1f3e] text-gray-400 hover:text-white"
            }`}
          >
            All
          </button>
          {TOPICS.map((topic) => (
            <button
              key={topic.value}
              onClick={() =>
                setFilters((prev) => ({ ...prev, topic: topic.value }))
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filters.topic === topic.value
                  ? topic.color
                      .replace("/20", "")
                      .replace("text-", "bg-")
                      .split(" ")[0] + " text-white"
                  : "bg-[#1a1f3e] text-gray-400 hover:text-white"
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>

        {/* Discussion List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading discussions...</p>
            </div>
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              No discussions found
            </h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.topic
                ? "Try adjusting your filters"
                : "Be the first to start a discussion!"}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-cyan-700 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Start a Discussion
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <DiscussionCard
                key={discussion._id}
                discussion={discussion}
                onClick={() => loadDiscussion(discussion._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Discussion Modal */}
      <CreateDiscussionModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDiscussion}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DiscussionPage;
