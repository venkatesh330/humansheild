// ActionPlanTab.tsx
// Actionable recommendations — Answers "What should I do about it?"
// Displays: Prioritized recommendations with checkboxes, progress tracking.

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Circle,
  Filter,
  Download,
  Zap,
  ArrowRight,
  Search,
  BarChart,
  Shield,
} from "lucide-react";
import { RecommendationPanel } from "@/components/LayoffCalculator/RecommendationPanel";
import { SectionHeader } from "./common/SectionHeader";
import { useAdaptiveSystem } from "@/hooks/useAdaptiveSystem";
import type { TabProps } from "./common/types";
import type { ActionPlanItem } from "@/types/hybridResult";

// ---------------------------------------------------------------------------
// ActionPlanItem with checkbox and state management
// ---------------------------------------------------------------------------

interface ActionItemProps {
  item: ActionPlanItem;
  isCompleted: boolean;
  onToggle: () => void;
}

const ActionItem: React.FC<ActionItemProps> = ({
  item,
  isCompleted,
  onToggle,
}) => {
  const priorityColor = {
    High: "var(--red)",
    Medium: "var(--orange)",
    Low: "var(--cyan)",
  };

  return (
    <div
      className={`action-item glass-panel group transition-all duration-300 hover:border-[var(--border-cyan)] mb-[var(--space-3)] rounded-xl overflow-hidden ${
        isCompleted ? "opacity-60 grayscale-[0.5]" : ""
      }`}
      style={{
        borderLeft: `4px solid ${priorityColor[item.priority as keyof typeof priorityColor]}`,
      }}
    >
      <div className="flex items-start gap-[var(--space-4)] p-[var(--space-5)]">
        <button
          onClick={onToggle}
          className="flex-shrink-0 mt-1 focus:outline-none group-hover:scale-110 transition-transform"
          aria-checked={isCompleted}
          role="checkbox"
        >
          {isCompleted ? (
            <CheckCircle className="w-6 h-6 text-[var(--emerald)]" />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground opacity-40" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap justify-between items-start mb-1 gap-[var(--space-2)]">
            <h4
              className={`text-base font-black tracking-tight ${isCompleted ? "line-through opacity-70" : ""}`}
            >
              {item.title}
            </h4>

            <div 
              className="text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest border"
              style={{
                backgroundColor: `${priorityColor[item.priority as keyof typeof priorityColor]}11`,
                color: priorityColor[item.priority as keyof typeof priorityColor],
                borderColor: `${priorityColor[item.priority as keyof typeof priorityColor]}33`,
              }}
            >
              {item.priority} PRIORITY
            </div>
          </div>

          <p
            className={`text-sm leading-relaxed text-muted-foreground mb-[var(--space-4)] ${isCompleted ? "opacity-50" : ""}`}
          >
            {item.description}
          </p>

          <div className="flex flex-wrap gap-[var(--space-4)] items-center text-[10px] font-mono tracking-wider uppercase text-muted-foreground/60">
            <div className="flex items-center gap-1.5 p-1 px-2 rounded bg-white/5 border border-white/5">
              <Shield className="w-3 h-3" />
              FOCUS: {item.layerFocus}
            </div>
            {item.deadline && (
              <div className="flex items-center gap-1.5 p-1 px-2 rounded bg-white/5 border border-white/5">
                <Zap className="w-3 h-3 text-[var(--amber)]" />
                DEADLINE: {item.deadline}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Progress indicator component
// ---------------------------------------------------------------------------

interface ProgressIndicatorProps {
  completed: number;
  total: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  completed,
  total,
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const color = percentage < 30 ? "var(--red)" : percentage < 70 ? "var(--orange)" : "var(--emerald)";

  return (
    <div className="progress-indicator glass-panel-heavy p-[var(--space-6)] rounded-2xl min-w-[280px]">
      <div className="flex justify-between items-end mb-[var(--space-3)]">
        <div>
          <h4 className="label-xs text-muted-foreground mb-1 uppercase tracking-widest">Mission Progress</h4>
          <span className="text-3xl font-black tracking-tighter" style={{ color }}>{percentage}%</span>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground bg-white/5 px-[var(--space-2)] py-1 rounded">
          {completed}/{total} ACTIONS
        </div>
      </div>

      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: "inherit",
            background: color,
            boxShadow: `0 0 10px ${color}66`,
          }}
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Export action plan button
// ---------------------------------------------------------------------------

const ExportButton: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-sm bg-muted-2 hover:bg-muted-3 text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors"
    >
      <Download className="w-4 h-4" />
      Export Plan
    </button>
  );
};

// ---------------------------------------------------------------------------
// ActionPlanTab main component
// ---------------------------------------------------------------------------

export const ActionPlanTab: React.FC<TabProps> = ({
  result,
  companyData,
  onDownload,
  onRecalculate,
}) => {
  // Use recommendations from result or fallback to empty array
  const actionPlan = result.recommendations || [];

  // Filter options
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Completed items storage
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(
    {},
  );

  // Load completed items from localStorage on mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem("actionPlanCompleted");
      if (savedItems) {
        setCompletedItems(JSON.parse(savedItems));
      }
    } catch (e) {
      console.error("Error loading action plan state:", e);
    }
  }, []);

  // Save to localStorage when completed items change
  useEffect(() => {
    try {
      localStorage.setItem(
        "actionPlanCompleted",
        JSON.stringify(completedItems),
      );
    } catch (e) {
      console.error("Error saving action plan state:", e);
    }
  }, [completedItems]);

  // Toggle completion state
  const toggleComplete = (id: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Apply filters
  const filteredItems = useMemo(() => {
    return actionPlan.filter((item) => {
      // Apply priority filter
      if (filter !== "all" && item.priority.toLowerCase() !== filter) {
        return false;
      }

      // Apply search filter
      if (
        search &&
        !item.title.toLowerCase().includes(search.toLowerCase()) &&
        !item.description.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [actionPlan, filter, search]);

  // Sort items: Incomplete High, then Medium, then Low, then Completed
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const aComplete = completedItems[a.id] || false;
      const bComplete = completedItems[b.id] || false;

      // First, sort by completion state
      if (aComplete !== bComplete) {
        return aComplete ? 1 : -1;
      }

      // Then sort by priority for incomplete items
      if (!aComplete) {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return 0;
    });
  }, [filteredItems, completedItems]);

  // Track progress
  const completedCount = useMemo(() => {
    return sortedItems.reduce((count, item) => {
      return count + (completedItems[item.id] ? 1 : 0);
    }, 0);
  }, [sortedItems, completedItems]);

  // Handle export button click
  const handleExport = () => {
    try {
      // Create a text representation of the action plan
      const exportText = [
        "# Personalized Action Plan\n",
        "Generated: " + new Date().toLocaleDateString() + "\n",
        ...sortedItems.map((item) => {
          return [
            `## ${item.title} (${item.priority} Priority)`,
            `Status: ${completedItems[item.id] ? "✓ Completed" : "○ Pending"}`,
            item.description,
            `Focus Area: ${item.layerFocus}`,
            item.deadline ? `Deadline: ${item.deadline}` : "",
            "\n",
          ].join("\n");
        }),
      ].join("\n");

      // Create downloadable file
      const blob = new Blob([exportText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `action-plan-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error exporting action plan:", e);
    }
  };

  return (
    <section aria-labelledby="action-plan-heading" className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <SectionHeader
              title="Personalized Action Plan"
              description="Prioritized recommendations to reduce your risk and build career resilience."
            />
            <p className="text-sm text-muted-foreground mb-4">
              Track your progress by checking off actions as you complete them.
              Your progress is saved automatically.
            </p>
          </div>

          <ProgressIndicator
            completed={completedCount}
            total={sortedItems.length}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search action items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 py-2 px-3 bg-muted border rounded-md text-sm"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2 items-center">
            <Filter className="text-muted-foreground w-4 h-4" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="py-2 px-3 bg-muted border rounded-md text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <ExportButton onClick={handleExport} />
          </div>
        </div>

        {/* Action Items */}
        <div className="space-y-2">
          {sortedItems.length > 0 ? (
            sortedItems.map((item) => (
              <ActionItem
                key={item.id}
                item={item}
                isCompleted={!!completedItems[item.id]}
                onToggle={() => toggleComplete(item.id)}
              />
            ))
          ) : (
            <div className="text-center p-8 bg-muted border rounded-lg">
              <p className="text-muted-foreground">
                {search || filter !== "all"
                  ? "No matching action items found. Try changing the search or filter."
                  : "No action items available."}
              </p>
            </div>
          )}
        </div>

        {/* Strategic Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-muted border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h4 className="font-semibold">Strategic Resources</h4>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <a href="#" className="text-blue-400 hover:underline">
                  Industry transition playbook
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <a href="#" className="text-blue-400 hover:underline">
                  Skills gap analysis worksheet
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <a href="#" className="text-blue-400 hover:underline">
                  Career resilience framework
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-muted border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart className="w-5 h-5 text-violet-500" />
              <h4 className="font-semibold">AI Adaptation Tools</h4>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <a href="#" className="text-blue-400 hover:underline">
                  AI skill prompt guide
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <a href="#" className="text-blue-400 hover:underline">
                  Automation-proof workflow builder
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <a href="#" className="text-blue-400 hover:underline">
                  Human advantage framework
                </a>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ActionPlanTab;
