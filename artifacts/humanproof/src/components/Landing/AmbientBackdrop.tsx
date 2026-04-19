import { cn } from "@/lib/utils";

type Props = {
  image?: string;
  className?: string;
  /** opacity for the image layer 0-100 */
  imageOpacity?: number;
  /** show animated scanline sweep */
  scanline?: boolean;
  /** show aurora gradient sweep */
  aurora?: boolean;
  /** show floating particles */
  particles?: boolean;
  /** show subtle grid */
  grid?: boolean;
  /** mask edges */
  fade?: "none" | "edges" | "bottom" | "top";
  /** blend mode for image */
  blend?: "screen" | "overlay" | "lighten" | "soft-light";
};

export function AmbientBackdrop({
  image,
  className,
  imageOpacity = 25,
  scanline = false,
  aurora = false,
  particles = false,
  grid = false,
  fade = "edges",
  blend = "screen",
}: Props) {
  const maskImage =
    fade === "edges"
      ? "radial-gradient(ellipse at center, black 40%, transparent 85%)"
      : fade === "bottom"
        ? "linear-gradient(to top, transparent, black 30%)"
        : fade === "top"
          ? "linear-gradient(to bottom, transparent, black 30%)"
          : undefined;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {image && (
        <div
          className="absolute inset-0 bg-pan"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: imageOpacity / 100,
            mixBlendMode: blend,
            maskImage,
            WebkitMaskImage: maskImage,
          }}
        />
      )}
      {grid && <div className="absolute inset-0 bg-grid opacity-40" />}
      {aurora && <div className="absolute inset-0 aurora-bg opacity-60" />}
      {particles && (
        <>
          <span
            className="absolute left-[12%] top-[28%] h-1.5 w-1.5 rounded-full bg-risk-critical particle-drift"
            style={{ animationDelay: "0s", boxShadow: "0 0 12px var(--risk-critical)" }}
          />
          <span
            className="absolute left-[78%] top-[18%] h-1 w-1 rounded-full bg-risk-info particle-drift"
            style={{ animationDelay: "1.2s", boxShadow: "0 0 10px var(--risk-info)" }}
          />
          <span
            className="absolute left-[62%] top-[68%] h-1.5 w-1.5 rounded-full bg-risk-warning particle-drift"
            style={{ animationDelay: "2.4s", boxShadow: "0 0 12px var(--risk-warning)" }}
          />
          <span
            className="absolute left-[28%] top-[78%] h-1 w-1 rounded-full bg-risk-stable particle-drift"
            style={{ animationDelay: "3.6s", boxShadow: "0 0 10px var(--risk-stable)" }}
          />
          <span
            className="absolute left-[45%] top-[42%] h-2 w-2 rounded-full bg-risk-critical/60 particle-drift"
            style={{ animationDelay: "1.8s", boxShadow: "0 0 16px var(--risk-critical)" }}
          />
        </>
      )}
      {scanline && <div className="scanline" />}
    </div>
  );
}
