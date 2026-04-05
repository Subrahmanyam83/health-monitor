export function AnimatedTitle() {
  return (
    <span
      className="text-xl font-extrabold tracking-tight"
      style={{
        background: "linear-gradient(90deg, #4338ca, #7c3aed, #db2777, #d97706, #4338ca)",
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
