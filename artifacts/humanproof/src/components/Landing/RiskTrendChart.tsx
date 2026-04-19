import { Activity, TrendingUp } from "lucide-react";

export function RiskTrendChart() {
  const data = [22, 24, 23, 28, 27, 33, 35, 38, 44, 52, 61, 67];
  const max = 80;
  const min = 0;
  const w = 600;
  const h = 220;
  const pad = 24;

  const points = data.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (data.length - 1);
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
    return [x, y] as const;
  });

  const path = points
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(" ");

  const area =
    `M ${points[0][0]} ${h - pad} ` +
    points.map(([x, y]) => `L ${x} ${y}`).join(" ") +
    ` L ${points[points.length - 1][0]} ${h - pad} Z`;

  const spikes = points
    .map(([x, y], i) => ({ x, y, i, delta: i === 0 ? 0 : data[i] - data[i - 1] }))
    .filter((p) => p.delta >= 6);

  return (
    <div className="glass-info shadow-card-elevated rounded-[2rem] border p-8 lift-card">
      <div className="flex items-end justify-between">
        <div>
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Activity className="h-3 w-3 text-risk-critical" />
            Weekly risk trend
          </p>
          <p className="mt-1 text-2xl font-semibold count-pop">
            67<span className="text-base text-muted-foreground">/100</span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-risk-critical pulse-dot" />
            <span className="text-muted-foreground">Spike</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-risk-info" />
            <span className="text-muted-foreground">Trend</span>
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-56 w-full">
        <defs>
          <linearGradient id="risk-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--risk-critical)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--risk-critical)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="risk-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--risk-info)" />
            <stop offset="100%" stopColor="var(--risk-critical)" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={pad}
            x2={w - pad}
            y1={pad + (i * (h - pad * 2)) / 3}
            y2={pad + (i * (h - pad * 2)) / 3}
            stroke="currentColor"
            strokeOpacity="0.08"
          />
        ))}

        <path d={area} fill="url(#risk-area)" opacity="0.9" />

        {/* Animated draw of the line */}
        <path
          d={path}
          fill="none"
          stroke="url(#risk-line)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="900"
          strokeDashoffset="900"
          style={{ animation: "draw-line 2.4s var(--transition-smooth) 0.2s forwards" }}
        />

        {/* Scan line overlay */}
        <line
          x1={pad}
          x2={w - pad}
          y1={pad}
          y2={h - pad}
          stroke="var(--risk-info)"
          strokeOpacity="0.25"
          strokeWidth="1"
          strokeDasharray="4 6"
          className="dash-scan"
        />

        {spikes.map((p) => (
          <g key={p.i}>
            <circle cx={p.x} cy={p.y} r={12} fill="var(--risk-critical)" opacity="0.18">
              <animate
                attributeName="r"
                values="6;14;6"
                dur="2.2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.35;0;0.35"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={p.x} cy={p.y} r={4} fill="var(--risk-critical)" />
          </g>
        ))}
      </svg>

      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>W1</span>
        <span>W4</span>
        <span>W8</span>
        <span>W12</span>
      </div>
    </div>
  );
}
