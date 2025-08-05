import { cn } from "@/lib/utils";
import { motion } from "motion/react";
interface ProgressBarProps {
  title: string;
  value: number;
}
export const ProgressBar = ({ title, value }: ProgressBarProps) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-space">
        <span className="text-slate-300">{title}</span>
        <span className="text-slate-300">{value.toFixed(2)}%</span>
      </div>
      <div className="w-full bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-800 rounded-full h-1.5 relative">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-emerald-400 to-progress-end z-0"
          style={{ filter: "blur(8px)" }} // Apply blur directly for the glow effect
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={cn(
            "h-1.5 rounded-full bg-gradient-to-r",
            value >= 90
              ? "from-emerald-400 to-progress-end"
              : value >= 80
                ? "from-sky-300 to-sky-100"
                : "from-orange-300 to-orange-100",
          )}
        />
      </div>
    </div>
  );
};
