"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: string;
  createdAt: Date;
}

interface Conversation {
  id: string;
  visitorId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  chatbot: { name: string };
  messages: Message[];
}

const FILTERS = ["ALL", "OPEN", "RESOLVED"];

export function ConversationsTable({ conversations }: { conversations: Conversation[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = conversations.filter((c) =>
    filter === "ALL" ? true : c.status === filter
  );

  async function resolve(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      if (!res.ok) throw new Error("Failed to update conversation");
      toast.success("Conversation marked resolved");
      setSelected((prev) => (prev && prev.id === id ? { ...prev, status: "RESOLVED" } : prev));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Main table */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
        {/* Filters */}
        <div className="flex items-center gap-1 border-b border-border p-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} conversations</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor</TableHead>
                <TableHead>Bot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last message</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    No conversations found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((convo) => (
                <TableRow
                  key={convo.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(convo)}
                >
                  <TableCell>
                    <p className="font-medium text-sm">{convo.visitorName ?? "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{convo.visitorEmail ?? convo.visitorId.slice(0, 8)}</p>
                  </TableCell>
                  <TableCell className="text-sm">{convo.chatbot.name}</TableCell>
                  <TableCell>
                    {convo.status === "OPEN" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <Clock className="h-3 w-3" /> Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Resolved
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs text-xs text-muted-foreground truncate">
                    {convo.messages[0]?.content ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(convo.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Slide-over panel */}
      {selected && (
        <div className="w-80 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-card flex flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <p className="font-semibold text-sm">{selected.visitorName ?? "Anonymous"}</p>
              <p className="text-xs text-muted-foreground">{selected.visitorEmail ?? selected.visitorId.slice(0, 8)}</p>
            </div>
            <button onClick={() => setSelected(null)}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selected.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2" />
                <p className="text-sm">No messages</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...selected.messages].reverse().map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "rounded-2xl px-3 py-2 text-sm max-w-[85%]",
                      msg.role === "USER"
                        ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selected.status === "OPEN" && (
            <div className="border-t border-border p-4">
              <Button
                className="w-full"
                size="sm"
                onClick={() => resolve(selected.id)}
                disabled={loading}
              >
                <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                Mark Resolved
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
