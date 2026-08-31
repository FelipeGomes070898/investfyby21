function toneFor(score: number) {
  if (score >= 7.5) return "#4E9E82";
  if (score >= 5.5) return "#C9A24B";
  if (score >= 4) return "#D2A857";
  return "#C1554A";
}

export function ScoreGauge({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(10, score)) / 10;
  const offset = circumference * (1 - pct);
  const color = toneFor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#26374480"
          strokeWidth={5}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="tabular text-sm font-semibold" style={{ color }}>
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
