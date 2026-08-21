"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText,
  className,
  style,
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} style={style} disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
