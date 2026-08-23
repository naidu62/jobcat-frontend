"use client";

// Community interactions API client (comments + likes).
import { authFetch } from "./auth";
import { fetchAPI } from "./api";

/**
 * List comments for a content target.
 * GET /api/community/comments/?target_type=job&target_id=12&page=1
 */
export async function listComments({ targetType, targetId, page = 1, pageSize }) {
  const params = new URLSearchParams({
    target_type: targetType,
    target_id: String(targetId),
    page: String(page),
  });
  if (pageSize) params.set("page_size", String(pageSize));
  return fetchAPI(`community/comments/?${params.toString()}`);
}

/**
 * Create a comment or reply.
 * POST /api/community/comments/ {target_type, target_id, text, parent_comment?}
 * Replies may omit target_* — the backend inherits it from the parent.
 */
export async function createComment({ targetType, targetId, text, parentComment = null }) {
  return authFetch("community/comments/", {
    method: "POST",
    body: JSON.stringify({
      ...(targetType && targetId ? { target_type: targetType, target_id: targetId } : {}),
      text,
      ...(parentComment ? { parent_comment: parentComment } : {}),
    }),
  });
}

/** PATCH /api/community/comments/{id}/ — owner only. */
export async function updateComment(commentId, text) {
  return authFetch(`community/comments/${commentId}/`, {
    method: "PATCH",
    body: JSON.stringify({ text }),
  });
}

/** DELETE /api/community/comments/{id}/ — soft delete, owner or staff. */
export async function deleteComment(commentId) {
  return authFetch(`community/comments/${commentId}/`, { method: "DELETE" });
}

/** POST /api/community/comments/{id}/like/ — toggles; returns {liked, like_count}. */
export async function toggleCommentLike(commentId) {
  return authFetch(`community/comments/${commentId}/like/`, { method: "POST" });
}
