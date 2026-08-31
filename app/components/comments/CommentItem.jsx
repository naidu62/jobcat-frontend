"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CornerDownRight, Pencil, Trash2 } from "lucide-react";
import { Avatar, LikeButton, relativeTime } from "./primitives";
import {
  createComment,
  deleteComment,
  updateComment,
} from "@/lib/community";

function canModerate(comment, me) {
  if (!me) return false;
  return comment.can_moderate || me.id === comment.author?.id;
}

function CommentBody({ text }) {
  return (
    <p className="text-sm text-gray-800 whitespace-pre-line break-words leading-relaxed">
      {text}
    </p>
  );
}

function ReplyComposer({ onSubmit, onCancel, busy }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const text = value.trim();
        if (!text) return;
        onSubmit(text, () => setValue(""));
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write a reply…"
        maxLength={2000}
        className="flex-1 min-h-[40px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="submit"
        disabled={busy || !value.trim()}
        className="min-h-[40px] px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
      >
        Reply
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="min-h-[40px] px-3 text-sm text-gray-600 hover:text-gray-900 transition"
      >
        Cancel
      </button>
    </form>
  );
}

export default function CommentItem({ comment, me, onReplyPosted, onDeleted }) {
  const [showReply, setShowReply] = useState(false);
  const [replies, setReplies] = useState(comment.replies ?? []);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [busy, setBusy] = useState(false);
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  const author = comment.author ?? {};
  const deleted = comment.is_deleted;

  async function submitReply(text, reset) {
    setBusy(true);
    try {
      // Replies inherit the parent's content target server-side.
      const created = await createComment({
        text,
        parentComment: comment.id,
      });
      setReplies((r) => [...r, created]);
      reset();
      setShowReply(false);
      onReplyPosted?.();
    } catch (err) {
      console.error(err);
      alert(err.message || "Could not post reply.");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    setBusy(true);
    try {
      const updated = await updateComment(comment.id, editText.trim());
      comment.text = updated.text;
      comment.updated_at = updated.updated_at;
      setEditing(false);
    } catch (err) {
      alert(err.message || "Could not update comment.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this comment?")) return;
    setBusy(true);
    try {
      await deleteComment(comment.id);
      setRemoved(true);
      onDeleted?.(comment.id);
    } catch (err) {
      alert(err.message || "Could not delete comment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="py-4 border-b border-gray-100 last:border-b-0"
    >
      <div className="flex gap-3">
        <Link href={author.username ? `/u/${author.username}` : "#"} aria-label="View profile">
          <Avatar name={author.display_name} url={author.avatar_url} />
        </Link>

        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-baseline gap-2 flex-wrap">
            {author.username ? (
              <Link
                href={`/u/${author.username}`}
                className="text-sm font-semibold text-gray-900 hover:text-blue-700 hover:underline"
              >
                {author.display_name}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-gray-900">
                {author.display_name}
              </span>
            )}
            <time dateTime={comment.created_at} className="text-xs text-gray-400">
              {relativeTime(comment.created_at)}
            </time>
            {comment.updated_at !== comment.created_at && !deleted && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>

          {/* Body */}
          <div className="mt-1">
            {deleted ? (
              <p className="text-sm italic text-gray-400">This comment was deleted.</p>
            ) : editing ? (
              <div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={busy || !editText.trim()}
                    className="min-h-[36px] px-4 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditText(comment.text);
                    }}
                    className="min-h-[36px] px-3 text-xs text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <CommentBody text={comment.text} />
            )}
          </div>

          {/* Actions */}
          {!deleted && me && (
            <div className="mt-2 -ml-2 flex items-center gap-1 flex-wrap">
              <LikeButton comment={comment} />
              <button
                type="button"
                onClick={() => setShowReply((s) => !s)}
                className="inline-flex items-center gap-1.5 min-h-[32px] px-2 rounded-md text-xs font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <CornerDownRight size={15} aria-hidden="true" />
                Reply
              </button>
              {canModerate(comment, me) && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 min-h-[32px] px-2 rounded-md text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  >
                    <Pencil size={14} aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 min-h-[32px] px-2 rounded-md text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

          {/* Replies */}
          <AnimatePresence initial={false}>
            {showReply && (
              <motion.div
                key="composer"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ReplyComposer
                  onSubmit={submitReply}
                  onCancel={() => setShowReply(false)}
                  busy={busy}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {replies.length > 0 && (
            <div className="mt-3 pl-3 sm:pl-5 border-l-2 border-gray-100 space-y-3">
              {replies.map((reply) => (
                <ReplyRow
                  key={reply.id}
                  reply={reply}
                  me={me}
                  onDeleted={(id) =>
                    setReplies((list) => list.filter((r) => r.id !== id))
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function ReplyRow({ reply, me, onDeleted }) {
  const author = reply.author ?? {};
  const [removed, setRemoved] = useState(false);
  if (removed) return null;

  async function remove() {
    try {
      await deleteComment(reply.id);
      onDeleted?.(reply.id);
      setRemoved(true);
    } catch (err) {
      alert(err.message || "Could not delete reply.");
    }
  }

  return (
    <div className="flex gap-2.5 pt-1">
      <Link href={author.username ? `/u/${author.username}` : "#"}>
        <Avatar name={author.display_name} url={author.avatar_url} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          {author.username ? (
            <Link
              href={`/u/${author.username}`}
              className="text-sm font-semibold text-gray-900 hover:text-blue-700 hover:underline"
            >
              {author.display_name}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-gray-900">{author.display_name}</span>
          )}
          <time dateTime={reply.created_at} className="text-xs text-gray-400">
            {relativeTime(reply.created_at)}
          </time>
        </div>
        {reply.is_deleted ? (
          <p className="text-sm italic text-gray-400 mt-0.5">This reply was deleted.</p>
        ) : (
          <CommentBody text={reply.text} />
        )}
        {!reply.is_deleted && me && (
          <div className="-ml-2 flex items-center gap-1">
            <LikeButton comment={reply} />
            {(reply.can_moderate || me.id === author.id) && (
              <button
                type="button"
                onClick={remove}
                className="inline-flex items-center gap-1.5 min-h-[32px] px-2 rounded-md text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 size={13} aria-hidden="true" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
