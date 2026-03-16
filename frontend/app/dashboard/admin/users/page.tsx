"use client";

import { useEffect, useState, useCallback } from "react";
import { User, X } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import { DataTable } from "@/components/admin/DataTable";

interface UserRow {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  provider: string;
  plan: string | null;
  createdAt: string;
  lastSignIn: string | null;
  [key: string]: unknown;
}

interface UserDetail {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  provider: string;
  createdAt: string;
  lastSignIn: string | null;
  role: string;
  subscription: {
    plan: string;
    status: string;
    price_cents: number;
    current_period_end: string;
  } | null;
  recentUsage: { endpoint: string; method: string; created_at: string }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `/api/admin/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`
      );
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch {}
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRowClick = async (row: UserRow) => {
    setDetailLoading(true);
    setSelectedUser(null);
    try {
      const res = await apiFetch(`/api/admin/users/${row.id}`);
      if (res.ok) setSelectedUser(await res.json());
    } catch {}
    setDetailLoading(false);
  };

  const columns = [
    {
      key: "avatarUrl",
      label: "",
      render: (row: UserRow) =>
        row.avatarUrl ? (
          <img
            src={row.avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-3.5 w-3.5" />
          </div>
        ),
    },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "provider",
      label: "Provider",
      render: (row: UserRow) => (
        <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs capitalize">
          {row.provider}
        </span>
      ),
    },
    {
      key: "plan",
      label: "Plan",
      render: (row: UserRow) => (
        <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${
          row.plan ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
        }`}>
          {row.plan ?? "Free"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Registered",
      render: (row: UserRow) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "lastSignIn",
      label: "Last Sign In",
      render: (row: UserRow) =>
        row.lastSignIn ? new Date(row.lastSignIn).toLocaleDateString() : "Never",
    },
  ];

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          total={total}
          page={page}
          limit={20}
          onPageChange={setPage}
          searchPlaceholder="Search by name or email..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
          onRowClick={handleRowClick}
        />
      )}

      {/* User detail panel */}
      {(selectedUser || detailLoading) && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border/40 bg-background shadow-xl">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <h3 className="text-base font-semibold text-foreground">User Detail</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : selectedUser ? (
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* Profile */}
                <div className="flex items-center gap-3">
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground">{selectedUser.name || selectedUser.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem label="Role" value={selectedUser.role} />
                  <InfoItem label="Provider" value={selectedUser.provider} />
                  <InfoItem label="Registered" value={new Date(selectedUser.createdAt).toLocaleDateString()} />
                  <InfoItem label="Last Sign In" value={selectedUser.lastSignIn ? new Date(selectedUser.lastSignIn).toLocaleDateString() : "Never"} />
                </div>

                {/* Subscription */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Subscription</h4>
                  {selectedUser.subscription ? (
                    <div className="rounded-lg border border-border/40 p-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plan</span>
                        <span className="capitalize text-foreground">{selectedUser.subscription.plan}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span className="capitalize text-foreground">{selectedUser.subscription.status}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price</span>
                        <span className="text-foreground">${(selectedUser.subscription.price_cents / 100).toFixed(2)}/mo</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No active subscription</p>
                  )}
                </div>

                {/* Recent API usage */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Recent API Usage</h4>
                  {selectedUser.recentUsage.length > 0 ? (
                    <div className="space-y-1">
                      {selectedUser.recentUsage.slice(0, 15).map((u, i) => (
                        <div key={i} className="flex justify-between text-xs text-muted-foreground">
                          <span className="font-mono">{u.method} {u.endpoint}</span>
                          <span>{new Date(u.created_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No API usage recorded</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/40 p-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium capitalize text-foreground">{value}</p>
    </div>
  );
}
