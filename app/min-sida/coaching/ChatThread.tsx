"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import AttachmentMedia from "@/components/AttachmentMedia";
import { linkify } from "@/lib/linkify";
import styles from "./page.module.css";

type Message = {
  id: string;
  sender: string;
  body: string;
  created_at: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
};

type Group = {
  sender: string;
  items: Message[];
};

function groupMessages(messages: Message[]): Group[] {
  const groups: Group[] = [];
  for (const m of messages) {
    const last = groups[groups.length - 1];
    if (last && last.sender === m.sender) {
      last.items.push(m);
    } else {
      groups.push({ sender: m.sender, items: [m] });
    }
  }
  return groups;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("sv-SE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatThread({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Inga meddelanden än — skriv din första fråga nedan.</p>
      </div>
    );
  }

  const groups = groupMessages(messages);

  return (
    <div className={styles.thread}>
      {groups.map((group, i) => {
        const isCoach = group.sender === "coach";
        return (
          <div
            key={i}
            className={`${styles.group} ${isCoach ? styles.groupCoach : styles.groupUser}`}
          >
            <span className={styles.groupMeta}>
              {isCoach ? "Felix" : "Du"} ·{" "}
              {formatTime(group.items[0].created_at)}
            </span>
            <div className={styles.groupRow}>
              {isCoach && (
                <div className={styles.avatar}>
                  <Image
                    src="/om-oss/felix.jpg"
                    alt="Felix Eliasson"
                    fill
                    sizes="32px"
                  />
                </div>
              )}
              <div className={styles.bubbleCol}>
                {group.items.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.bubble} ${
                      isCoach ? styles.bubbleCoach : styles.bubbleUser
                    } ${m.attachment_url ? styles.bubbleMedia : ""}`}
                  >
                    {m.attachment_url && m.attachment_type && (
                      <AttachmentMedia url={m.attachment_url} type={m.attachment_type} />
                    )}
                    {m.body && <div className={styles.bubbleText}>{linkify(m.body)}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
