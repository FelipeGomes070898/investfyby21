import clsx from "clsx";
import type { ReactNode } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-lg border border-ink-line bg-ink-surface", className)}>
      {children}
    </div>
  );
}

export function Badge({
  tone = "muted",
  children,
}: {
  tone?: "pos" | "neg" | "warn" | "brass" | "muted";
  children: ReactNode;
}) {
  const toneClasses: Record<string, string> = {
    pos: "bg-pos-soft text-pos border-pos/30",
    neg: "bg-neg-soft text-neg border-neg/30",
    warn: "bg-warn-soft text-warn border-warn/30",
    brass: "bg-brass-soft text-brass border-brass/30",
    muted: "bg-ink-raised text-text-muted border-ink-line",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary"
          ? "bg-brass text-ink hover:bg-brass-strong"
          : "border border-ink-line text-text hover:bg-ink-raised",
        className
      )}
    >
      {children}
    </button>
  );
}

export function ChangeValue({ value, suffix = "%" }: { value: number | null | undefined; suffix?: string }) {
  if (value === null || value === undefined) return <span className="text-text-faint tabular">—</span>;
  const positive = value >= 0;
  return (
    <span className={clsx("tabular font-medium", positive ? "text-pos" : "text-neg")}>
      {positive ? "+" : ""}
      {value.toFixed(2)}
      {suffix}
    </span>
  );
}

export function PulseDot({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-pos animate-pulse-dot" />
      {label}
    </span>
  );
}
