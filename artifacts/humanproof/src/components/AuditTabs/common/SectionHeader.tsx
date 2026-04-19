// SectionHeader.tsx
// Heading with optional info tooltip.
// Used consistently across all tab sections.

import React from "react";
import { HelpCircle } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // optional extra actions (e.g., export button)
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div
      className="section-header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "var(--space-6)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <h3 className="label-xs font-black tracking-[0.2em] uppercase text-muted-foreground opacity-80" style={{ margin: 0 }}>
          {title}
        </h3>
        {description && (
          <div
            className="relative group"
            title={description}
            style={{ cursor: "help" }}
          >
            <HelpCircle
              className="w-3.5 h-3.5 text-muted-foreground opacity-40 hover:opacity-100 transition-opacity"
              aria-hidden="true"
            />
            <span className="sr-only">{description}</span>
          </div>
        )}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
};

export default SectionHeader;
