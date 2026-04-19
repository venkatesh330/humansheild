// TabSkeleton.tsx
// Loading placeholder shown while lazy-loaded tab content is being fetched.

import React from "react";

export const TabSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 py-6" aria-busy="true" aria-live="polite">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />

      {/* Two-column grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-muted/30 rounded-xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-20 bg-muted/30 rounded-xl animate-pulse" />
          <div className="h-20 bg-muted/30 rounded-xl animate-pulse" />
          <div className="h-20 bg-muted/30 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Full-width section skeleton */}
      <div className="h-40 bg-muted/30 rounded-xl animate-pulse" />
    </div>
  );
};

export default TabSkeleton;
