import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2, ShoppingCart, Check, Sparkles, Users, Clock, BookOpen,
  ChevronDown, ChevronRight, Lock, PlayCircle, ArrowLeft, Star,
} from "lucide-react";
import { marketplaceAPI } from "../../services/marketplaceAPI";
import { money } from "../../services/creatorAPI";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../contexts/ToastContext";

interface Detail {
  course: any;
  curriculum: Array<{
    _id: string;
    title: string;
    description?: string;
    lessons: Array<{ title: string; duration?: number; order: number; isPreview: boolean }>;
  }>;
  creator: {
    displayName?: string;
    headline?: string;
    publishedCourses: number;
    totalStudents: number;
  } | null;
  access: { canOpen: boolean; via: string | null; reason: string | null; requiresPurchase: boolean };
  stats: { lessonCount: number; sectionCount: number; students: number };
}

/**
 * Public sales page for a course.
 *
 * Separate from CourseLearningPage, which assumes the viewer already has
 * access — it has no notion of a paywall, so sending a prospective buyer there
 * either errored or showed content they had not paid for.
 */
export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [open, setOpen] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!courseId) return;
    marketplaceAPI
      .getCourse(courseId)
      .then((d) => {
        setData(d);
        // First section expanded: the outline is the pitch, so show some of it
        // without making the visitor click.
        if (d.curriculum?.[0]) setOpen(new Set([d.curriculum[0]._id]));
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [courseId]);

  const buy = async () => {
    if (!isAuthenticated) {
      navigate(`/signin?redirect=/marketplace/${courseId}`);
      return;
    }
    setBuying(true);
    try {
      window.location.href = await marketplaceAPI.buy(courseId!);
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Could not start checkout", "error");
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex flex-col items-center justify-center px-4">
        <p className="text-gray-300">This course isn't available.</p>
        <button
          onClick={() => navigate("/marketplace")}
          className="text-cyan-400 hover:text-cyan-300 text-sm underline mt-2"
        >
          Back to the marketplace
        </button>
      </div>
    );
  }

  const { course, curriculum, creator, access, stats } = data;
  const isFree = (course.priceCents ?? 0) === 0;

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="min-h-screen bg-[#0a0e27] px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/marketplace")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span className="uppercase">{course.language}</span>
                <span>·</span>
                <span>{course.difficulty}</span>
                {course.includedInPro && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <Sparkles className="w-3 h-3" /> Included with Pro
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white">{course.title}</h1>
              {course.shortDescription && (
                <p className="text-gray-400 mt-3">{course.shortDescription}</p>
              )}

              <div className="flex items-center gap-5 mt-4 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {stats.students} students
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> {stats.lessonCount} lessons
                </span>
                {course.estimatedHours ? (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {course.estimatedHours} hours
                  </span>
                ) : null}
                {(course.averageRating ?? 0) > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {course.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {course.description && (
              <section>
                <h2 className="text-lg font-semibold text-gray-100 mb-2">About</h2>
                <div
                  className="text-gray-400 text-sm leading-relaxed prose-invert"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              </section>
            )}

            <section>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">
                Curriculum
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {stats.sectionCount} sections · {stats.lessonCount} lessons
                </span>
              </h2>

              <div className="space-y-2">
                {curriculum.map((s) => {
                  const isOpen = open.has(s._id);
                  return (
                    <div key={s._id} className="rounded-lg border border-[#232a45] bg-[#0f1424]">
                      <button
                        onClick={() => toggle(s._id)}
                        className="w-full flex items-center gap-2 p-3 text-left"
                      >
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="flex-1 text-gray-100 font-medium">{s.title}</span>
                        <span className="text-xs text-gray-500">
                          {s.lessons.length} lesson{s.lessons.length === 1 ? "" : "s"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-[#232a45] px-3 py-2">
                          {s.lessons.length === 0 ? (
                            <p className="text-xs text-gray-600 py-1.5 pl-6">No lessons yet.</p>
                          ) : (
                            s.lessons.map((l) => (
                              <div
                                key={`${s._id}-${l.order}`}
                                className="flex items-center gap-2 py-1.5 pl-6"
                              >
                                {access.canOpen || l.isPreview ? (
                                  <PlayCircle className="w-3.5 h-3.5 text-cyan-400/70 shrink-0" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                                )}
                                <span className="text-sm text-gray-400 flex-1 truncate">
                                  {l.title}
                                </span>
                                {l.isPreview && !access.canOpen && (
                                  <span className="text-xs text-cyan-400">preview</span>
                                )}
                                {l.duration ? (
                                  <span className="text-xs text-gray-600">{l.duration}m</span>
                                ) : null}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {creator && (
              <section className="rounded-lg border border-[#232a45] bg-[#0f1424] p-4">
                <h2 className="text-sm font-semibold text-gray-300 mb-2">Instructor</h2>
                <p className="text-gray-100 font-medium">
                  {creator.displayName ?? course.instructor?.name}
                </p>
                {creator.headline && (
                  <p className="text-sm text-gray-400 mt-0.5">{creator.headline}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {creator.publishedCourses} course
                  {creator.publishedCourses === 1 ? "" : "s"} · {creator.totalStudents} students
                </p>
              </section>
            )}
          </div>

          {/* Purchase panel */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 rounded-xl border border-[#232a45] bg-[#0f1424] overflow-hidden">
              {course.thumbnail && (
                <img src={course.thumbnail} alt="" className="w-full aspect-video object-cover" />
              )}

              <div className="p-5">
                <p className="text-3xl font-bold text-white">
                  {isFree ? "Free" : money(course.priceCents)}
                </p>

                {access.canOpen ? (
                  <>
                    <div className="flex items-center gap-2 mt-3 text-sm text-green-400">
                      <Check className="w-4 h-4" />
                      {access.via === "purchase"
                        ? "You own this course"
                        : access.via === "subscription"
                        ? "Included with your plan"
                        : access.via === "author"
                        ? "You created this course"
                        : "You have access"}
                    </div>
                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      Start learning
                    </button>
                  </>
                ) : isFree ? (
                  // Nothing to sell. A signed-out visitor looking at a $0
                  // course was being offered a checkout, which is nonsense —
                  // they just need an account.
                  <>
                    <button
                      onClick={() =>
                        navigate(
                          isAuthenticated
                            ? `/courses/${course._id}`
                            : `/signin?redirect=/marketplace/${course._id}`
                        )
                      }
                      className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      {isAuthenticated ? "Start learning" : "Sign in to start"}
                    </button>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Free · no card required
                    </p>
                  </>
                ) : (
                  <>
                    <button
                      onClick={buy}
                      disabled={buying}
                      className="w-full mt-4 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      {buying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                      Buy this course
                    </button>

                    {course.includedInPro && (
                      <button
                        onClick={() => navigate("/pricing")}
                        className="w-full mt-2 flex items-center justify-center gap-2 border border-purple-500/40 text-purple-300 hover:bg-purple-950/30 py-2.5 rounded-lg text-sm transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        Or get it with Pro
                      </button>
                    )}

                    <p className="text-xs text-gray-500 mt-3 text-center">
                      One-time purchase · lifetime access
                    </p>
                  </>
                )}

                <ul className="mt-5 space-y-2 text-sm border-t border-[#232a45] pt-4">
                  <li className="flex items-center gap-2 text-gray-400">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    {stats.lessonCount} lessons
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    Runnable code examples
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    Reviewed before publication
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
