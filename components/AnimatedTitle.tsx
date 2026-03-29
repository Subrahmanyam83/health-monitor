"use client";

export function AnimatedTitle() {
  return (
    <span
      className="text-lg font-bold tracking-wide animate-fade-in"
      style={{
        background: "linear-gradient(90deg, #ffffff 0%, #c7d2fe 40%, #ffffff 60%, #a5f3fc 100%)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: "shimmer 3s linear infinite, fadeIn 0.6s ease-out",
      }}
    >
      Sunakshini Mini Apps
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </span>
  );
}
