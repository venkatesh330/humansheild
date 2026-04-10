import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface SelectOption {
  key: string;
  label: string;
  icon?: string | React.ReactNode;
  cat?: string;
  color?: string;
}

export interface PremiumSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  groups?: Record<string, SelectOption[]>;
}

const PremiumSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  label,
  disabled = false,
  className,
  groups,
}: PremiumSelectProps) => {
  const selectedOption = options.find((opt) => opt.key === value);

  return (
    <div className={cn("input-wrap", className)}>
      {label && <label className="input-label">{label}</label>}
      <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
        <SelectPrimitive.Trigger className="select-trigger">
          <div className="flex items-center gap-3 overflow-hidden">
            {selectedOption?.icon && (
              <span className="select-item-icon shrink-0">
                {selectedOption.icon}
              </span>
            )}
            <div className="truncate">
              <SelectPrimitive.Value placeholder={placeholder} />
            </div>
          </div>
          <SelectPrimitive.Icon className="shrink-0">
            <ChevronDown className="w-4 h-4 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content 
            className="select-content" 
            position="popper" 
            sideOffset={5}
            // Ensure the content doesn't overflow the viewport
            style={{ maxHeight: 'var(--radix-select-content-available-height)' }}
          >
            <SelectPrimitive.ScrollUpButton className="select-scroll-btn">
              <ChevronUp className="w-4 h-4" />
            </SelectPrimitive.ScrollUpButton>
            
            <SelectPrimitive.Viewport className="select-viewport custom-scrollbar">
              {groups ? (
                Object.entries(groups).map(([groupName, groupOptions]) => (
                  <SelectPrimitive.Group key={groupName}>
                    <SelectPrimitive.Label className="select-group-label">{groupName}</SelectPrimitive.Label>
                    {groupOptions.map((opt) => (
                      <SelectItem key={opt.key} option={opt} />
                    ))}
                    <SelectPrimitive.Separator className="select-separator" />
                  </SelectPrimitive.Group>
                ))
              ) : (
                options.map((opt) => (
                  <SelectItem key={opt.key} option={opt} />
                ))
              )}
            </SelectPrimitive.Viewport>

            <SelectPrimitive.ScrollDownButton className="select-scroll-btn">
              <ChevronDown className="w-4 h-4" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
};

const SelectItem = React.forwardRef<
  HTMLDivElement,
  { option: SelectOption } & React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ option, className, ...props }, ref) => {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn("select-item", className)}
      value={option.key}
      style={option.color ? { ['--item-accent' as any]: option.color } : undefined}
      {...props}
    >
      <span className="select-item-icon" style={option.color ? { color: option.color } : undefined}>
        {option.icon}
      </span>
      <SelectPrimitive.ItemText>
        <span className="select-item-label" style={option.color ? { color: option.color } : undefined}>
          {option.label}
        </span>
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Check className="w-4 h-4" style={{ color: option.color || 'var(--cyan)' }} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = "SelectItem";

export { PremiumSelect };
