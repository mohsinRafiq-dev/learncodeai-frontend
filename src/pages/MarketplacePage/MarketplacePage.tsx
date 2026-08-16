import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2, Search, Star, Users, Clock, Check, Sparkles, ShoppingCart,
} from "lucide-react";
import {
  marketplaceAPI,
  type MarketplaceCourse,
  type BrowseFilters,
} from "../../services/marketplaceAPI";
import { money } from "../../services/creatorAPI";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../contexts/ToastContext";

const SORTS = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
] as const;

const PRICE_FILTERS = [
  { value: undefined, label: "All" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
  { value: "included", label: "In Pro" },
] as const;

export default function MarketplacePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [courses, setCourses] = useState<MarketplaceCourse[]>([]);
  const [facets, setFacets] = useState<{ languages: { value: string; count: number }[] } | null>(null);
  const [filters, setFilters] = useState<BrowseFilters>({ sort: "popular", page: 1 });
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [buying, setBuying] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await marketplaceAPI.browse(filters);
      setCourses(data.courses);
      setTotal(data.pagination.total);
    } catch {
      showToast("Couldn't load courses", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    marketplaceAPI.getFilters().then(setFacets).catch(() => setFacets(null));
  }, []);

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(
      () => setFilters((f) => ({ ...f, search: searchInput || undefined, page: 1 })),
      350
    );
    return () => clearTimeout(t);
  }, [searchInput]);

  const buy = async (course: MarketplaceCourse) => {
    if (!isAuthenticated) {
      navigate(`/signin?redirect=/marketplace`);
      return;
    }
    setBuying(course._id);
    try {
      window.location.href = await marketplaceAPI.buy(course._id);
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Could not start checkout", "error");
      setBuying(null);
    }
  };

  const set = (patch: Partial<BrowseFilters>) =>
    setFilters((f) => ({ ...f, ...patch, page: 1 }));

  return (
    <div className="min-h-screen bg-[#0a0e27] px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Course marketplace</h1>
          <p className="text-gray-400 mt-2">
            Courses from independent creators, reviewed before they go on sale.
          </p>
        </header>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search courses…"
              className="w-full bg-[#0f1424] border border-[#232a45] rounded-lg pl-10 pr-4 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <select
            value={filters.language ?? ""}
            onChange={(e) => set({ language: e.target.value || undefined })}
            className="bg-[#0f1424] border border-[#232a45] rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:border-cyan-500/60"
          >
            <option value="">All languages</option>
            {facets?.languages.map((l) => (
              <option key={l.value} value={l.value}>
                {l.value} ({l.count})
              </option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => set({ sort: e.target.value as BrowseFilters["sort"] })}
            className="bg-[#0f1424] border border-[#232a45] rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:border-cyan-500/60"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {PRICE_FILTERS.map((p) => (
            <button
              key={p.label}
              onClick={() => set({ price: p.value })}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                filters.price === p.value
                  ? "bg-cyan-900/30 text-cyan-300 border-cyan-500/40"
                  : "text-gray-400 hover:bg-[#141a2e] border-transparent"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2c3454] py-20 text-center">
            <p className="text-gray-300 font-medium">No courses match that.</p>
            <p className="text-sm text-gray-500 mt-1">
              Try clearing the filters, or check back soon.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{total} course{total === 1 ? "" : "s"}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {courses.map((c) => (
                <CourseCard
                  key={c._id}
                  course={c}
                  buying={buying === c._id}
                  onOpen={() => navigate(`/courses/${c._id}`)}
                  onBuy={() => buy(c)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CourseCard({
  course, buying, onOpen, onBuy,
}: {
  course: MarketplaceCourse;
  buying: boolean;
  onOpen: () => void;
  onBuy: () => void;
}) {
  const { access } = course;

  return (
    <article className="rounded-xl border border-[#232a45] bg-[#0f1424] overflow-hidden flex flex-col hover:border-[#2c3454] transition-colors">
      <div className="aspect-video bg-[#141a2e] relative overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl font-bold">
            {course.language?.slice(0, 2).toUpperCase()}
          </div>
        )}

        {access.owned && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium bg-green-600 text-white">
            Owned
          </span>
        )}
        {!access.owned && access.coveredByPro && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-600 text-white">
            <Sparkles className="w-3 h-3" /> In Pro
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
          <span className="uppercase">{course.language}</span>
          <span>·</span>
          <span>{course.difficulty}</span>
        </div>

        <h3 className="font-medium text-gray-100 line-clamp-2">{course.title}</h3>

        {course.shortDescription && (
          <p className="text-sm text-gray-400 mt-1.5 line-clamp-2 flex-1">
            {course.shortDescription}
          </p>
        )}

        {course.instructor && (
          <p className="text-xs text-gray-500 mt-2">by {course.instructor.name}</p>
        )}

        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          {(course.averageRating ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {course.averageRating?.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {course.enrollmentCount ?? 0}
          </span>
          {course.estimatedHours ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.estimatedHours}h
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 mt-4">
          <span className="text-lg font-bold text-gray-100">
            {access.isFree ? "Free" : money(course.priceCents)}
          </span>

          {access.canOpen ? (
            <button
              onClick={onOpen}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              {access.owned || access.coveredByPro ? "Open" : "Start"}
            </button>
          ) : (
            <button
              onClick={onBuy}
              disabled={buying}
              className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors"
            >
              {buying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
              Buy
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
