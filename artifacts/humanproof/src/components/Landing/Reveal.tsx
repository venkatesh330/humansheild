import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/useReveal";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
  variant?: "up" | "fade" | "scale";
};

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  variant = "up",
}: Props) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const Tag = as as React.ElementType;

  const initial =
    variant === "up"
      ? "opacity-0 translate-y-4"
      : variant === "scale"
        ? "opacity-0 scale-[0.97]"
        : "opacity-0";

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "opacity-100 translate-y-0 scale-100" : initial,
        className,
      )}
    >
      {children}
    </Tag>
  );
}
