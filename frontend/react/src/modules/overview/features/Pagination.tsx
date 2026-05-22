import { useEffect, useRef, useState } from "react";
import useData from "./hooks/useData";

type PaginationType = "button" | "pages" | "scroll";

function PaginationEX() {
  const [type, setType] = useState<PaginationType>("button");
  const { data, loadMore, goToPage, page, totalPages, loading } = useData(
    type === "pages" ? "replace" : "append",
  );

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (type !== "scroll") return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && data.length < totalPages * 10) {
          loadMore();
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [type, loading, data.length, totalPages, loadMore]);

  const allLoaded = type === "pages" ? false : data.length >= totalPages * 10;

  return (
    <div className="mx-auto max-w-md p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Users</h2>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as PaginationType)}
          className="rounded border border-gray-300 px-3 py-1 text-sm"
        >
          <option value="button">Button Based</option>
          <option value="pages">Pages Based</option>
          <option value="scroll">Scrolling Based</option>
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {data.map((user, index) => (
          <div
            key={`${user.id}-${user.firstName}-${index}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50"
          >
            <span className="text-gray-800">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-sm text-gray-500">{user.age}</span>
          </div>
        ))}
      </div>

      {type === "button" && !allLoaded && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-5 w-full rounded-lg border border-gray-300 py-2 text-gray-700 transition hover:bg-gray-100 active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}

      {type === "pages" && totalPages > 0 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            ‹ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`rounded px-3 py-1 text-sm ${
                p === page
                  ? "bg-blue-500 text-white"
                  : "border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next ›
          </button>
        </div>
      )}

      {type === "scroll" && (
        <div ref={sentinelRef} className="mt-5 h-4" />
      )}
      {loading && type === "scroll" && (
        <p className="mt-3 text-center text-sm text-gray-500">Loading...</p>
      )}
    </div>
  );
}

export default PaginationEX;
