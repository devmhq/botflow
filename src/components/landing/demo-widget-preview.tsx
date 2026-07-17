"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

interface ScriptLine {
  role: "user" | "assistant";
  text: string;
}

const SCRIPT: ScriptLine[] = [
  { role: "assistant", text: "Hi! Welcome to Aurora Salon 👋 How can I help you today?" },
  { role: "user", text: "Do you have any openings this Saturday?" },
  { role: "assistant", text: "Yes! We have 11am and 2:30pm open for a haircut. Want me to book one for you?" },
  { role: "user", text: "2:30pm works great" },
  { role: "assistant", text: "Booked! I just need your name and phone number to confirm." },
];

const TYPE_SPEED_MS = 22;
const PAUSE_AFTER_MESSAGE_MS = 900;
const RESTART_DELAY_MS = 2600;

export function DemoWidgetPreview() {
  const [visible, setVisible] = useState<{ role: ScriptLine["role"]; text: string }[]>([]);
  const [typingIndex, setTypingIndex] = useState<number | null>(0);
  const [partial, setPartial] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function schedule(fn: () => void, delay: number) {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, delay);
      timeouts.push(id);
      return id;
    }

    function playLine(index: number) {
      if (index >= SCRIPT.length) {
        schedule(() => {
          setVisible([]);
          setPartial("");
          setTypingIndex(0);
          playLine(0);
        }, RESTART_DELAY_MS);
        return;
      }

      const line = SCRIPT[index];
      setTypingIndex(index);
      let charIndex = 0;

      function typeChar() {
        charIndex += 1;
        setPartial(line.text.slice(0, charIndex));
        if (charIndex < line.text.length) {
          schedule(typeChar, TYPE_SPEED_MS);
        } else {
          schedule(() => {
            setVisible((prev) => [...prev, line]);
            setPartial("");
            setTypingIndex(null);
            schedule(() => playLine(index + 1), 300);
          }, PAUSE_AFTER_MESSAGE_MS);
        }
      }

      schedule(typeChar, 400);
    }

    playLine(0);

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
      <div className="flex items-center gap-3 bg-gradient-brand px-4 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <MessageCircle className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Aurora Salon Assistant</p>
          <p className="flex items-center gap-1 text-xs text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
          </p>
        </div>
      </div>

      <div className="flex h-80 flex-col gap-2 overflow-hidden bg-muted/40 p-4">
        {visible.map((line, i) => (
          <div
            key={i}
            className={cnBubble(line.role)}
          >
            {line.text}
          </div>
        ))}

        {typingIndex !== null && (
          <div className={cnBubble(SCRIPT[typingIndex].role)}>
            {partial}
            <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-current align-middle" />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card p-3">
        <div className="flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm text-muted-foreground">
          Type a message…
        </div>
      </div>
    </div>
  );
}

function cnBubble(role: ScriptLine["role"]) {
  const base = "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed";
  return role === "user"
    ? `${base} self-end rounded-br-sm bg-gradient-brand text-white`
    : `${base} self-start rounded-bl-sm bg-secondary text-secondary-foreground`;
}
