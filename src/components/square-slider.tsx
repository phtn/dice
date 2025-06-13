import { Slider } from "@/components/ui/slider";
import { SliderProps } from "@radix-ui/react-slider";

export const SquareSlider = (props: SliderProps) => {
  return (
    <Slider
      {...props}
      className="[&>:last-child>span]:rounded"
      aria-label="Slider with square thumb"
    />
  );
};
