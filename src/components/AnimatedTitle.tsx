export function AnimatedTitle() {
  return (
    <span
      className="text-xl font-extrabold tracking-tight"
      style={{
        background: "linear-gradient(90deg, #fff, #fde68a, #f9a8d4, #a5f3fc, #fff)",
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
