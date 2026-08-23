"use client";

// app/admin/moderation/users/page.jsx — user management.
// Search by username/email; warn / suspend / restore actions map to
// POST /api/admin/users/{id}/{action}/ (audit-logged, object-level guarded).

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { searchUsers, userAction } from "@/lib/admin";
import { ActionModal, UserModStatus } from "../_components";

function UserRow({ user, onAction }) {
  const status = user.moderation_status || "active";
  const name =
    user.first_name || user.last_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : user.email.split("@")[0];

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-2 pr-3">
        <p className="font-medium text-gray-900 truncate max-w-[220px]">{name}</p>
        <p className="text-xs text-gray-500 truncate max-w-[240px]">{user.email}</p>
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 hidden sm:table-cell">
        {user.username ? (
          <Link
            href={`/u/${user.username}`}
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            @{user.username}
          </Link>
        ) : (
          "—"
        )}
      </td>
      <td className="py-2 px-3">
        <UserModStatus status={status} />
      </td>
      <td className="py-2 px-3 text-sm text-gray-600 hidden md:table-cell">
        {user.warning_count}
      </td>
      <td className="py-2 pl-3">
        <div className="flex justify-end gap-1.5 flex-wrap">
          <button
            onClick={() => onAction(user, "warn")}
            className="px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Warn
          </button>
          <button
            disabled={status === "suspended"}
            onClick={() => onAction(user, "suspend")}
            className="px-2 py-1 text-xs border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 disabled:opacity-40"
          >
            Suspend
          </button>
          {status !== "active" && (
            <button
              onClick={() => onAction(user, "restore")}
              className="px-2 py-1 text-xs border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50"
            >
              Restore
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function ModerationUsersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // { user, action }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchUsers({ search, page });
      setUsers(data?.results || []);
      setCount(data?.count || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const submitAction = async (reason) => {
    if (!modal) return;
    await userAction(modal.user.id, modal.action, reason);
    setModal(null);
    await load();
  };

  const totalPages = Math.max(1, Math.ceil(count / 20));

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">User management</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
        className="flex gap-2 mb-4"
      >
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by username or email…"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Loading users…</p>
      ) : error ? (
        <p className="text-center py-8 text-red-500">{error}</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left min-w-[560px]">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200 bg-gray-50">
                <th className="py-2 pr-3 font-medium">User</th>
                <th className="py-2 px-3 font-medium hidden sm:table-cell">Profile</th>
                <th className="py-2 px-3 font-medium">Status</th>
                <th className="py-2 px-3 font-medium hidden md:table-cell">Warnings</th>
                <th className="py-2 pl-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow key={u.id} user={u} onAction={(user, action) => setModal({ user, action })} />
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            ← Prev
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}

      {modal && (
        <ActionModal
          title={
            modal.action === "restore"
              ? `Restore ${modal.user.email}?`
              : `${modal.action[0].toUpperCase()}${modal.action.slice(1)} ${modal.user.email}?`
          }
          confirmLabel={modal.action}
          danger={modal.action === "suspend"}
          onSubmit={submitAction}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
