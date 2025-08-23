"use client";

import { useToneCtx } from "@/ctx/tone-ctx";

export default function ToneButton() {
  const { playTone } = useToneCtx();

  return (
    <button
      onClick={playTone}
      className="p-4 mx-2 bg-[#4cafef] text-white rounded-md cursor-pointer border-none"
      style={{
        padding: "8px 16px",
        margin: "8px",
        background: "#4cafef",
        border: "none",
        borderRadius: "4px",
        color: "white",
        cursor: "pointer",
      }}
    >
      Play Tone
    </button>
  );
}
