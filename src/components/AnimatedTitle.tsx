"use client";

export function AnimatedTitle() {
  return (
    <>
      <span
        className="text-[18px] font-extrabold tracking-tight"
        style={{
          background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #f59e0b, #6366f1)",
          backgroundSize: "250% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "rainbow 5s linear infinite, popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }}
      >
        Sunakshini Mini Apps
      </span>
      <style>{`
        @keyframes rainbow {
          0%   { background-position: 0% center; }
          100% { background-position: 250% center; }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.85) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
