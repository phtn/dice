import { ClassName } from "@/app/types";
import { cn } from "@/lib/utils";

interface ChipProps {
  value: number;
  onClick: VoidFunction;
  selected?: boolean;
  disabled?: boolean;
  className?: ClassName;
}
const getChipColor = (value: number) => {
  switch (value) {
    case 5:
      return "stroke-zinc-100 fill-chip-a bg-chip-a border-chip-a";
    case 10:
      return "stroke-zinc-100 fill-chip-b bg-chip-b border-chip-b";
    case 25:
      return "stroke-zinc-100 fill-chip-c bg-chip-c border-chip-c";
    case 50:
      return "stroke-zinc-100 fill-chip-d bg-chip-d border-chip-d";
    case 100:
      return "stroke-zinc-100 fill-chip-e bg-chip-e border-chip-e";
    case 250:
      return "stroke-zinc-100 fill-chip-f bg-chip-f border-chip-f";
    case 500:
      return "stroke-zinc-100 fill-chip-f bg-chip-f border-chip-f";
    default:
      return "stroke-zinc-100 fill-chip-g bg-chip-g border-chip-g";
  }
};

export const Chipp = ({ value, selected, onClick, disabled }: ChipProps) => {
  const colorClass = getChipColor(value);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-12 h-12 rounded-full border-4 flex items-center justify-center
        text-white text-xs font-bold transition-all duration-200
        ${colorClass}
        ${selected ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}
        ${!disabled && !selected ? "hover:ring-1 hover:ring-white hover:ring-offset-1 hover:ring-offset-neutral-900" : ""}
      `}
    >
      <span className="drop-shadow-lg">{value}</span>
      {selected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-neutral-900"></div>
      )}
    </button>
  );
};

export const Chip = ({
  value,
  selected,
  onClick,
  disabled,
  className,
}: ChipProps) => {
  const colorClass = getChipColor(value);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full border border-zinc-400",
        "relative w-12 h-12 flex items-center justify-center overflow-hidden",
        "hover:scale-105 cursor-pointer text-white text-xs font-bold transition-all duration-200",
        {
          "ring-2 ring-white/40 ring-offset-2 ring-offset-neutral-900 scale-110":
            selected,
          "opacity-50 cursor-not-allowed": disabled,
          "hover:ring-1 hover:ring-white hover:ring-offset-1 hover:ring-offset-neutral-900":
            !disabled && !selected,
        },
        colorClass,
      )}
    >
      <svg
        viewBox="0 0 78 78"
        className={`size-16 aspect-square flex items-center justify-center ${className} ${colorClass}`}
        // style="color: rgb(249, 150, 57);"
      >
        <g>
          <circle
            className={cn("drop-shadow-xs", colorClass)}
            cx="39.019"
            cy="38.999"
            r="38.5"
          ></circle>
          <path
            className={cn("drop-shadow-xs", colorClass)}
            // stroke={"rgb(249, 150, 57)"}
            // strokeWidth={1.5}
            d="M38.94 12.5A26.5 26.5 0 1 0 65.44 39a26.529 26.529 0 0 0-26.5-26.5zm0 52A25.5 25.5 0 1 1 64.439 39 25.53 25.53 0 0 1 38.94 64.5z"
          ></path>
          <circle
            // fill={color}
            className={cn("drop-shadow-xs", colorClass)}
            strokeWidth={1.5}
            cx="39"
            cy="38.997"
            r="25.5"
          ></circle>
          <path
            className={colorClass}
            strokeWidth={1.5}
            d="M38.941 0a39 39 0 1 0 39 39 39.046 39.046 0 0 0-39-39zm-2.088 76.439l.483-8.471a28.99 28.99 0 0 1-4.668-.639l-1.783 8.291a37.277 37.277 0 0 1-12.144-5.051l4.6-7.124a29.143 29.143 0 0 1-8.85-8.851l-7.124 4.6a37.28 37.28 0 0 1-5.045-12.13l8.3-1.784a28.99 28.99 0 0 1-.639-4.668l-8.483.482C1.463 40.4 1.44 39.7 1.44 39s.023-1.391.061-2.08l8.478.483a28.99 28.99 0 0 1 .639-4.668l-8.3-1.785a37.275 37.275 0 0 1 5.047-12.142l7.126 4.6a29.143 29.143 0 0 1 8.85-8.851l-4.6-7.125a37.28 37.28 0 0 1 12.142-5.05l1.786 8.3a28.99 28.99 0 0 1 4.668-.639l-.483-8.484c.692-.038 1.388-.061 2.089-.061s1.4.023 2.087.061l-.483 8.484a28.99 28.99 0 0 1 4.668.639L47 2.381a37.276 37.276 0 0 1 12.14 5.05l-4.6 7.126a29.14 29.14 0 0 1 8.849 8.85l7.127-4.6a37.276 37.276 0 0 1 5.044 12.142l-8.3 1.785a28.99 28.99 0 0 1 .64 4.666l8.478-.483c.038.689.061 1.382.061 2.08s-.023 1.4-.062 2.1l-8.477-.486a28.99 28.99 0 0 1-.639 4.668l8.3 1.784a37.282 37.282 0 0 1-5.046 12.132l-7.125-4.6a29.14 29.14 0 0 1-8.849 8.85l4.6 7.125A37.275 37.275 0 0 1 47 75.619l-1.783-8.291a28.99 28.99 0 0 1-4.668.639l.483 8.471c-.691.038-1.386.061-2.087.061s-1.401-.022-2.092-.06z"
          ></path>
        </g>
      </svg>
      <span className="text-white font-space font-medium text-base absolute -tracking-widest drop-shadow-sm">
        {value}
      </span>
    </button>
  );
};
