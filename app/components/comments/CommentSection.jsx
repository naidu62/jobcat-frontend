"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, Loader2 } from "lucide-react";
import CommentItem from "./CommentItem";
import { Avatar } from "./primitives";
import { listComments, createComment } from "@/lib/community";
import { getUser, isAuthenticated, resolveMediaUrl } from "@/lib/auth";

const PAGE_SIZE = 10;

/**
 * Social-style comment section.
 * - Public read, authenticated write
 * - Newest first, paginated; a sentinel enables infinite scroll and a
 *   fallback "Load more" button keeps it accessible.
 */
export default function CommentSection({ targetType, targetId }) {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [me, setMe] = useState(null);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated()) setMe(getUser());
  }, []);

  // Initial load + reload when target changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listComments({ targetType, targetId, page: 1, pageSize: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        setComments(data.results ?? []);
        setCount(data.count ?? 0);
        setHasMore(Boolean(data.next));
        setPage(1);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId]);

  // Infinite scroll via IntersectionObserver on the sentinel row.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, loadingMore, comments.length]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const data = await listComments({ targetType, targetId, page: next, pageSize: PAGE_SIZE });
      setComments((list) => [...list, ...(data.results ?? [])]);
      setHasMore(Boolean(data.next));
      setPage(next);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, page, targetType, targetId]);

  async function postComment(e) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setPosting(true);
    try {
      const created = await createComment({ targetType, targetId, text: value });
      setComments((list) => [created, ...list]);
      setCount((c) => c + 1);
      setText("");
    } catch (err) {
      alert(err.message || "Could not post comment.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <section id="comments" className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={18} className="text-blue-600" aria-hidden="true" />
        <h2 className="text-base font-semibold text-gray-900">
          Comments{" "}
          <span className="text-gray-400 font-normal">
            ({count > 99 ? "99+" : count})
          </span>
        </h2>
      </div>

      {/* Composer */}
      {me ? (
        <form onSubmit={postComment} className="flex gap-3 mb-2">
          <Avatar
            name={me.full_name || me.email}
            url={resolveMediaUrl(me.profile?.avatar_url) || ""}
          />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts…"
              rows={3}
              maxLength={2000}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={posting || !text.trim()}
                className="inline-flex items-center gap-2 min-h-[40px] px-5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {posting && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
                Comment
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="mb-4 text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
          <Link
            href={`/login?next=${encodeURIComponent(`/jobs/${targetId}`)}`}
            className="font-medium text-blue-700 hover:underline"
          >
            Sign in
          </Link>{" "}
          or{" "}
          <Link
            href={`/register?next=${encodeURIComponent(`/jobs/${targetId}`)}`}
            className="font-medium text-blue-700 hover:underline"
          >
            register
          </Link>{" "}
          to join the discussion. Comments are public to all visitors.
        </p>
      )}

      {/* List */}
      {loading ? (
        <div className="py-8 space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-full max-w-md bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="py-6 text-center text-sm text-red-500">{error}</p>
      ) : comments.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8 text-center text-sm text-gray-400"
        >
          No comments yet — be the first to help other job seekers.
        </motion.p>
      ) : (
        <div className="divide-y divide-gray-100">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              me={me}
              onDeleted={(id) => {
                setComments((list) => list.filter((c) => c.id !== id));
                setCount((c) => Math.max(0, c - 1));
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination footer / sentinel */}
      {!loading && hasMore && (
        <div ref={sentinelRef} className="pt-4 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 min-h-[40px] px-5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition"
          >
            {loadingMore && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            {loadingMore ? "Loading…" : "Load more comments"}
          </button>
        </div>
      )}
    </section>
  );
}
