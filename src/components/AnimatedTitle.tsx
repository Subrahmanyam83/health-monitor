export function AnimatedTitle() {
  return (
    <span
      className="text-xl font-extrabold tracking-tight"
      style={{
        background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #f59e0b, #6366f1)",
        backgroundSize: "250% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: "titleRainbow 5s linear infinite, titlePopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
      }}
    >
      Sunakshini Mini Apps
    </span>
  );
}
