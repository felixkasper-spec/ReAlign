"use client";

export default function TokenLinkInput({ value }: { value: string }) {
  return (
    <input
      readOnly
      value={value}
      onFocus={(e) => e.currentTarget.select()}
    />
  );
}
