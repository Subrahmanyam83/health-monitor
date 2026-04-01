"use client";

import Image from "next/image";

export function AnimatedTitle() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="Sunakshini Mini Apps"
        height={28}
        width={28}
        style={{ objectFit: "contain", mixBlendMode: "screen" }}
        priority
      />
      <span
        className="text-xl font-extrabold tracking-wide"
        style={{
          background: "linear-gradient(90deg, #ff6eb4, #ff9a3c, #ffe94d, #6ef7a7, #60c8ff, #c084fc, #ff6eb4)",
          backgroundSize: "300% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "rainbow 3s linear infinite, popIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }}
      >
        Sunakshini Mini Apps
      </span>
      <style>{`
        @keyframes rainbow {
          0%   { background-position: 0% center; }
          100% { background-position: 300% center; }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.7) translateY(-8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
