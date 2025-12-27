import { X } from "lucide-react";
import { type CourseSection } from "../../../services/adminCourseAPI";

interface SectionFormProps {
  show: boolean;
  editingSection: CourseSection | null;
  formData: {
    title: string;
    description: string;
    estimatedHours: number;
    order: number;
  };
  setFormData: (data: {
    title: string;
    description: string;
    estimatedHours: number;
    order: number;
  }) => void;
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export default function SectionForm({
  show,
  editingSection,
  formData,
  setFormData,
  loading,
  onSave,
  onCancel,
}: SectionFormProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1230] border border-[#2a3050] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-[#2a3050] flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-1">
              Admin Panel / Sections
            </div>
            <h2 className="text-xl font-bold text-gray-100">
              {editingSection ? "Edit Section" : "Add New Section"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-[#1a1f3e] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Section Title *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter section title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional section description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={formData.estimatedHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedHours: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Order
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 bg-[#1a1f3e] border border-[#2a3050] rounded-md text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Section order (0, 1, 2...)"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#2a3050] flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 border border-[#2a3050] rounded-md hover:bg-[#1a1f3e] text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading || !formData.title.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
          >
            {loading
              ? "Saving..."
              : editingSection
              ? "Update Section"
              : "Create Section"}
          </button>
        </div>
      </div>
    </div>
  );
}
