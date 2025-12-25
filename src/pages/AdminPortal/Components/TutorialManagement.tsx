import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  X,
} from "lucide-react";
import { adminTutorialAPI } from "../../../services/adminTutorialAPI";
import { useToast } from "../../../contexts/ToastContext";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";

interface TutorialManagementProps {
  onError?: (message: string) => void;
  highlightedTutorialId?: string;
}

export default function TutorialManagement({ highlightedTutorialId }: TutorialManagementProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedTutorial, setHighlightedTutorial] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; tutorialId: string | null }>({
    show: false,
    tutorialId: null,
  });
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    language: "",
    concept: "",
    difficulty: "beginner",
    content: "",
    tags: [] as string[],
    codeExamples: [] as Array<{ code: string; explanation?: string }>,
    notes: [] as string[],
    tips: [] as string[],
  });
  
  const [newLanguage, setNewLanguage] = useState("");
  const [newConcept, setNewConcept] = useState("");
  const [showNewLanguageInput, setShowNewLanguageInput] = useState(false);
  const [showNewConceptInput, setShowNewConceptInput] = useState(false);

  // Handle highlighting
  useEffect(() => {
    if (highlightedTutorialId) {
      setHighlightedTutorial(highlightedTutorialId);
      // Remove highlight after animation
      setTimeout(() => {
        setHighlightedTutorial(null);
      }, 3000);
    }
  }, [highlightedTutorialId]);

  // Load tutorials on mount
  useEffect(() => {
    fetchTutorials();
    fetchLanguages();
  }, [selectedLanguage, selectedDifficulty, searchTerm, activeTab]);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (activeTab !== "all") params.language = activeTab;
      if (selectedDifficulty !== "all") params.difficulty = selectedDifficulty;
      if (searchTerm) params.search = searchTerm;
      
      const response = await adminTutorialAPI.getAllTutorials(params);
      setTutorials(response.data || []);
    } catch (error) {
      showToast("Failed to load tutorials", "error");
      console.error("Error fetching tutorials:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await adminTutorialAPI.getLanguages();
      setLanguages(response.data || []);
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  };

  const fetchConcepts = async (language: string) => {
    try {
      const response = await adminTutorialAPI.getConcepts(language);
      setConcepts(response.data || []);
    } catch (error) {
      console.error("Error fetching concepts:", error);
    }
  };

  const handleLanguageChange = (language: string) => {
    setFormData({ ...formData, language, concept: "" });
    if (language) {
      fetchConcepts(language);
    }
  };

  const openAddModal = () => {
    setEditingTutorial(null);
    setFormData({
      title: "",
      description: "",
      language: "",
      concept: "",
      difficulty: "beginner",
      content: "",
      tags: [],
      codeExamples: [],
      notes: [],
      tips: [],
    });
    setShowAddModal(true);
  };

  const openEditModal = async (tutorial: any) => {
    setEditingTutorial(tutorial);
    setFormData({
      title: tutorial.title || "",
      description: tutorial.description || "",
      language: tutorial.language || "",
      concept: tutorial.concept || "",
      difficulty: tutorial.difficulty || "beginner",
      content: tutorial.content || "",
      tags: tutorial.tags || [],
      codeExamples: tutorial.codeExamples || [],
      notes: tutorial.notes || [],
      tips: tutorial.tips || [],
    });
    
    if (tutorial.language) {
      await fetchConcepts(tutorial.language);
    }
    
    setShowAddModal(true);
  };

  const handleSaveTutorial = async () => {
    try {
      if (!formData.title || !formData.content || !formData.language || !formData.concept) {
        showToast("Please fill in all required fields", "error");
        return;
      }

      setLoading(true);
      
      if (editingTutorial) {
        await adminTutorialAPI.updateTutorial(editingTutorial._id, formData);
        showToast("Tutorial updated successfully", "success");
      } else {
        await adminTutorialAPI.createTutorial(formData);
        showToast("Tutorial created successfully", "success");
      }
      
      setShowAddModal(false);
      fetchTutorials();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save tutorial", "error");
      console.error("Error saving tutorial:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTutorial = async () => {
    if (!deleteConfirm.tutorialId) return;
    
    try {
      setLoading(true);
      await adminTutorialAPI.deleteTutorial(deleteConfirm.tutorialId);
      showToast("Tutorial deleted successfully", "success");
      setDeleteConfirm({ show: false, tutorialId: null });
      fetchTutorials();
    } catch (error) {
      showToast("Failed to delete tutorial", "error");
      console.error("Error deleting tutorial:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tag.trim()] });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const addNote = (note: string) => {
    if (note.trim() && !formData.notes.includes(note.trim())) {
      setFormData({ ...formData, notes: [...formData.notes, note.trim()] });
    }
  };

  const removeNote = (index: number) => {
    setFormData({
      ...formData,
      notes: formData.notes.filter((_, i) => i !== index),
    });
  };

  const addTip = (tip: string) => {
    if (tip.trim() && !formData.tips.includes(tip.trim())) {
      setFormData({ ...formData, tips: [...formData.tips, tip.trim()] });
    }
  };

  const removeTip = (index: number) => {
    setFormData({
      ...formData,
      tips: formData.tips.filter((_, i) => i !== index),
    });
  };

  const addCodeExample = () => {
    setFormData({
      ...formData,
      codeExamples: [...formData.codeExamples, { code: "", explanation: "" }],
    });
  };

  const updateCodeExample = (index: number, field: 'code' | 'explanation', value: string) => {
    const updated = [...formData.codeExamples];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, codeExamples: updated });
  };

  const removeCodeExample = (index: number) => {
    setFormData({
      ...formData,
      codeExamples: formData.codeExamples.filter((_, i) => i !== index),
    });
  };

  const handleAddNewLanguage = () => {
    if (newLanguage.trim()) {
      const langLower = newLanguage.trim().toLowerCase();
      if (!languages.includes(langLower)) {
        setLanguages([...languages, langLower]);
      }
      setFormData({ ...formData, language: langLower, concept: "" });
      setConcepts([]);
      setNewLanguage("");
      setShowNewLanguageInput(false);
    }
  };

  const handleAddNewConcept = () => {
    if (newConcept.trim()) {
      const conceptValue = newConcept.trim();
      if (!concepts.includes(conceptValue)) {
        setConcepts([...concepts, conceptValue]);
      }
      setFormData({ ...formData, concept: conceptValue });
      setNewConcept("");
      setShowNewConceptInput(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              Admin Panel / Tutorials
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tutorial Management
            </h1>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Tutorial
          </button>
        </div>
      </div>

      {/* Language Tabs and Filters */}
      <div className="bg-white border-b border-gray-200">
        {/* Tabs */}
        <div className="px-6 border-b border-gray-200">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Languages
            </button>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === lang
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {/* Filters */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tutorials Table */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">
                  TITLE
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">
                  CONCEPT
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">
                  AUTHOR
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">
                  DIFFICULTY
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">
                  DATE
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">
                  LANGUAGE
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Loading tutorials...
                  </td>
                </tr>
              ) : tutorials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No tutorials found
                  </td>
                </tr>
              ) : (
                tutorials.map((tutorial) => (
                  <tr
                    key={tutorial._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 ${
                      highlightedTutorial === tutorial._id 
                        ? 'bg-blue-50 border-l-4 border-l-blue-500 border-r-4 border-r-blue-500 border-t-2 border-t-blue-400 border-b-2 border-b-blue-400 shadow-lg shadow-blue-200/50 animate-pulse' 
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {tutorial.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tutorial.concept}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tutorial.createdBy?.name || "Admin"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-medium ${
                          tutorial.difficulty === "beginner"
                            ? "bg-green-50 text-green-700"
                            : tutorial.difficulty === "intermediate"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {tutorial.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(tutorial.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tutorial.language.charAt(0).toUpperCase() + tutorial.language.slice(1)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(tutorial)}
                          className="p-1.5 hover:bg-gray-100 rounded text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ show: true, tutorialId: tutorial._id })}
                          className="p-1.5 hover:bg-gray-100 rounded text-red-600"
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
        </div>

        {/* Stats */}
        {tutorials.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {tutorials.length} tutorial{tutorials.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>

      {/* Add Tutorial Modal */}
      {showAddModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Admin Panel / Tutorials / {editingTutorial ? "Edit" : "Create New"}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTutorial ? "Edit Tutorial" : "Create New Tutorial"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSaveTutorial}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingTutorial ? "Update Tutorial" : "Create Tutorial"}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-3 gap-6 p-6">
                {/* Left Sidebar */}
                <div className="space-y-6">
                  {/* Tutorial Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Tutorial Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Tutorial Title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Brief description of the tutorial"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Language *
                    </label>
                    {!showNewLanguageInput ? (
                      <div className="space-y-2">
                        <select
                          value={formData.language}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a language</option>
                          {languages.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setShowNewLanguageInput(true)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          + Add new language
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Enter new language name"
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddNewLanguage();
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddNewLanguage}
                            className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            Add Language
                          </button>
                          <button
                            onClick={() => {
                              setShowNewLanguageInput(false);
                              setNewLanguage("");
                            }}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Concept */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Concept *
                    </label>
                    {!showNewConceptInput ? (
                      <div className="space-y-2">
                        <select
                          value={formData.concept}
                          onChange={(e) =>
                            setFormData({ ...formData, concept: e.target.value })
                          }
                          disabled={!formData.language}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="">Select a concept</option>
                          {concepts.map((concept) => (
                            <option key={concept} value={concept}>
                              {concept}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setShowNewConceptInput(true)}
                          disabled={!formData.language}
                          className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + Add new concept
                        </button>
                        {!formData.language && (
                          <p className="text-xs text-gray-500">
                            Select a language first
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Enter new concept name"
                          value={newConcept}
                          onChange={(e) => setNewConcept(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddNewConcept();
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddNewConcept}
                            className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            Add Concept
                          </button>
                          <button
                            onClick={() => {
                              setShowNewConceptInput(false);
                              setNewConcept("");
                            }}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:bg-blue-100 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add tags..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add tags to improve discoverability.
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Notes
                    </label>
                    <div className="space-y-2 mb-2">
                      {formData.notes.map((note, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2 bg-gray-50 rounded text-xs"
                        >
                          <span className="flex-1">{note}</span>
                          <button
                            onClick={() => removeNote(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add a note..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const value = e.currentTarget.value.trim();
                          e.currentTarget.value = "";
                          e.preventDefault();
                          if (value) addNote(value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Tips */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Tips
                    </label>
                    <div className="space-y-2 mb-2">
                      {formData.tips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2 bg-yellow-50 rounded text-xs"
                        >
                          <span className="flex-1">{tip}</span>
                          <button
                            onClick={() => removeTip(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add a tip..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const value = e.currentTarget.value.trim();
                          e.currentTarget.value = "";
                          e.preventDefault();
                          if (value) addTip(value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="col-span-2 space-y-4">
                  {/* Tutorial Content */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Tutorial Content *
                    </label>
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      <div className="bg-white p-4 min-h-[300px]">
                        <textarea
                          placeholder="Write the tutorial content here. You can use markdown formatting."
                          value={formData.content}
                          onChange={(e) =>
                            setFormData({ ...formData, content: e.target.value })
                          }
                          className="w-full h-full min-h-[280px] text-sm text-gray-700 focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports markdown formatting
                    </p>
                  </div>

                  {/* Code Examples */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-900">
                        Code Examples
                      </label>
                      <button
                        onClick={addCodeExample}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Example
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.codeExamples.map((example, idx) => (
                        <div key={idx} className="border border-gray-300 rounded-md p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-700">
                              Example {idx + 1}
                            </span>
                            <button
                              onClick={() => removeCodeExample(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            <textarea
                              placeholder="Enter code example..."
                              value={example.code}
                              onChange={(e) => updateCodeExample(idx, 'code', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              rows={4}
                            />
                            <input
                              type="text"
                              placeholder="Explanation (optional)"
                              value={example.explanation || ""}
                              onChange={(e) => updateCodeExample(idx, 'explanation', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                          </div>
                        </div>
                      ))}
                      
                      {formData.codeExamples.length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-4">
                          No code examples added yet. Click "Add Example" to add one.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="Delete Tutorial"
        message="Are you sure you want to delete this tutorial? This action cannot be undone."
        onConfirm={handleDeleteTutorial}
        onCancel={() => setDeleteConfirm({ show: false, tutorialId: null })}
        confirmText="Delete"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
}

