import { useEffect, useState, useCallback } from "react";
import {
  Loader2, Plus, Trash2, ChevronDown, ChevronRight, ArrowLeft,
  AlertCircle, CheckCircle2, Save, GripVertical,
} from "lucide-react";
import {
  creatorAPI,
  type CreatorCourse,
  type CourseSection,
  type CourseLesson,
  type Readiness,
} from "../../services/creatorAPI";
import { useToast } from "../../contexts/ToastContext";

/**
 * Course authoring: sections, lessons and course settings.
 *
 * Readiness is shown continuously rather than only on submit, because
 * validateForSubmission rejects on things a creator cannot otherwise see
 * (missing thumbnail, fewer than three lessons) and discovering that at the
 * final step is the worst time to learn it.
 */
export default function CourseEditor({
  course,
  onBack,
  onChanged,
}: {
  course: CreatorCourse;
  onBack: () => void;
  onChanged: () => void;
}) {
  const { showToast } = useToast();
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [lessonsBySection, setLessonsBySection] = useState<Record<string, CourseLesson[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{ sectionId: string; lesson?: CourseLesson } | null>(null);

  // Locked while a reviewer has it, so the published course matches what was
  // approved.
  const locked = course.status === "pending_review";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [secs, ready] = await Promise.all([
        creatorAPI.listSections(course._id),
        creatorAPI.getReadiness(course._id).catch(() => null),
      ]);
      const list = Array.isArray(secs) ? secs : [];
      setSections(list);
      setReadiness(ready);

      const map: Record<string, CourseLesson[]> = {};
      await Promise.all(
        list.map(async (s) => {
          try {
            const ls = await creatorAPI.listLessons(s._id);
            map[s._id] = Array.isArray(ls) ? ls : [];
          } catch {
            map[s._id] = [];
          }
        })
      );
      setLessonsBySection(map);
    } catch {
      showToast("Couldn't load the course outline", "error");
    } finally {
      setLoading(false);
    }
  }, [course._id, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const addSection = async () => {
    const title = prompt("Section title:");
    if (!title?.trim()) return;
    setBusy(true);
    try {
      await creatorAPI.addSection(course._id, { title: title.trim() });
      showToast("Section added", "success");
      await load();
      onChanged();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Could not add section", "error");
    } finally {
      setBusy(false);
    }
  };

  const removeSection = async (s: CourseSection) => {
    const n = lessonsBySection[s._id]?.length ?? 0;
    if (!confirm(`Delete "${s.title}"${n ? ` and its ${n} lesson(s)` : ""}?`)) return;
    setBusy(true);
    try {
      await creatorAPI.deleteSection(s._id);
      showToast("Section deleted", "success");
      await load();
      onChanged();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Could not delete", "error");
    } finally {
      setBusy(false);
    }
  };

  const removeLesson = async (lesson: CourseLesson) => {
    if (!confirm(`Delete "${lesson.title}"?`)) return;
    setBusy(true);
    try {
      await creatorAPI.deleteLesson(lesson._id);
      showToast("Lesson deleted", "success");
      await load();
      onChanged();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Could not delete", "error");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const totalLessons = Object.values(lessonsBySection).reduce((n, l) => n + l.length, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-gray-100 truncate">{course.title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {sections.length} section{sections.length === 1 ? "" : "s"} · {totalLessons}{" "}
            lesson{totalLessons === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {locked && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-4 py-3 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200">
            This course is under review and locked for editing. Withdraw it to make
            changes.
          </p>
        </div>
      )}

      {/* Continuous readiness, not a surprise at submit time. */}
      {readiness && (
        <div
          className={`rounded-lg border px-4 py-3 ${
            readiness.valid
              ? "border-green-500/30 bg-green-950/20"
              : "border-[#232a45] bg-[#0f1424]"
          }`}
        >
          <div className="flex items-center gap-2">
            {readiness.valid ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-300">Ready to submit for review.</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-300">
                  Before you can submit ({readiness.problems.length} item
                  {readiness.problems.length === 1 ? "" : "s"} left):
                </p>
              </>
            )}
          </div>
          {!readiness.valid && (
            <ul className="mt-2 space-y-1 ml-6">
              {readiness.problems.map((p) => (
                <li key={p} className="text-xs text-gray-400 list-disc">
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {sections.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#2c3454] py-12 text-center">
              <p className="text-gray-300 font-medium">No sections yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Add a section, then lessons inside it.
              </p>
            </div>
          ) : (
            sections.map((s) => {
              const lessons = lessonsBySection[s._id] ?? [];
              const open = expanded.has(s._id);
              return (
                <div key={s._id} className="rounded-lg border border-[#232a45] bg-[#0f1424]">
                  <div className="flex items-center gap-2 p-3">
                    <button
                      onClick={() => toggle(s._id)}
                      className="p-1 text-gray-500 hover:text-gray-300"
                    >
                      {open ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <GripVertical className="w-4 h-4 text-gray-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-100 font-medium truncate">{s.title}</p>
                      <p className="text-xs text-gray-500">
                        {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    {!locked && (
                      <>
                        <button
                          onClick={() => setEditingLesson({ sectionId: s._id })}
                          className="flex items-center gap-1.5 text-xs border border-[#2c3454] hover:bg-[#141a2e] text-gray-300 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Lesson
                        </button>
                        <button
                          onClick={() => removeSection(s)}
                          disabled={busy}
                          className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {open && (
                    <div className="border-t border-[#232a45] px-3 py-2">
                      {lessons.length === 0 ? (
                        <p className="text-xs text-gray-600 py-2 pl-8">No lessons yet.</p>
                      ) : (
                        lessons.map((l) => (
                          <div
                            key={l._id}
                            className="flex items-center gap-2 py-1.5 pl-8 group"
                          >
                            <span className="text-sm text-gray-300 flex-1 truncate">
                              {l.title}
                            </span>
                            {l.codeExamples?.length ? (
                              <span className="text-xs text-cyan-400/70">
                                {l.codeExamples.length} example
                                {l.codeExamples.length === 1 ? "" : "s"}
                              </span>
                            ) : null}
                            {l.duration ? (
                              <span className="text-xs text-gray-600">{l.duration}m</span>
                            ) : null}
                            {!locked && (
                              <>
                                <button
                                  onClick={() =>
                                    setEditingLesson({ sectionId: s._id, lesson: l })
                                  }
                                  className="text-xs text-gray-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => removeLesson(l)}
                                  className="p-1 text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {!locked && (
            <button
              onClick={addSection}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-[#2c3454] hover:border-cyan-500/40 hover:bg-[#0f1424] text-gray-400 hover:text-cyan-400 py-3 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Add section
            </button>
          )}
        </div>
      )}

      {editingLesson && (
        <LessonModal
          sectionId={editingLesson.sectionId}
          lesson={editingLesson.lesson}
          onClose={() => setEditingLesson(null)}
          onSaved={() => {
            setEditingLesson(null);
            load();
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function LessonModal({
  sectionId, lesson, onClose, onSaved,
}: {
  sectionId: string;
  lesson?: CourseLesson;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: lesson?.title ?? "",
    description: lesson?.description ?? "",
    content: lesson?.content ?? "",
    duration: String(lesson?.duration ?? 15),
    difficulty: lesson?.difficulty ?? "beginner",
  });
  const [code, setCode] = useState(lesson?.codeExamples?.[0]?.code ?? "");
  const [expected, setExpected] = useState(lesson?.codeExamples?.[0]?.expectedOutput ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title.trim()) {
      showToast("A lesson title is required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        content: form.content,
        duration: parseInt(form.duration, 10) || 15,
        difficulty: form.difficulty,
        // Only send an example when there is actually code — an empty one would
        // fail the reviewer's sandbox check for no reason.
        codeExamples: code.trim()
          ? [{ title: form.title.trim(), code, expectedOutput: expected || undefined, order: 1 }]
          : [],
      };
      if (lesson) await creatorAPI.updateLesson(lesson._id, payload);
      else await creatorAPI.addLesson(sectionId, payload);
      showToast(lesson ? "Lesson updated" : "Lesson added", "success");
      onSaved();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Could not save lesson", "error");
    } finally {
      setSaving(false);
    }
  };

  const field =
    "w-full bg-[#0f1424] border border-[#232a45] rounded-lg px-3 py-2 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-[#232a45] bg-[#0b0f1d] p-6">
        <h3 className="font-semibold text-gray-100">
          {lesson ? "Edit lesson" : "New lesson"}
        </h3>

        <div className="space-y-4 mt-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Title</label>
            <input
              className={field}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What this lesson covers"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Minutes</label>
              <input
                type="number"
                min="1"
                className={field}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Difficulty</label>
              <select
                className={field}
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Lesson content</label>
            <textarea
              className={`${field} min-h-[160px] resize-y font-mono text-sm`}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Markdown or HTML. This is what the student reads."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">
              Code example <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              className={`${field} min-h-[120px] resize-y font-mono text-sm`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Runnable code. Reviewers execute this in the sandbox before approving."
            />
            <p className="text-xs text-amber-400/70 mt-1">
              Make sure it runs — a course whose examples fail is rejected.
            </p>
          </div>

          {code.trim() && (
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">
                Expected output <span className="text-gray-500">(optional)</span>
              </label>
              <input
                className={`${field} font-mono text-sm`}
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                placeholder="Leave blank to only check that it runs"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-[#2c3454] hover:bg-[#141a2e] text-gray-300 py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save lesson
          </button>
        </div>
      </div>
    </div>
  );
}
