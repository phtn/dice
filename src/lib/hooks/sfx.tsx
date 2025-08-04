import useSound from "use-sound";

export const useSFX = () => {
  const opts = {
    volume: 0.4,
    interrupt: true,
  };

  const [clickSFX] = useSound("/sfx/click.mp3", opts);
  const [tickSFX] = useSound("/sfx/tick.mp3", opts);
  const [stepSFX] = useSound("/sfx/step.mp3", opts);
  const [winSFX] = useSound("/sfx/win.mp3", {
    volume: 0.2,
  });

  const [tapSFX] = useSound("/sfx/darbuka.wav", {
    volume: 1,
    interrupt: true,
    playbackRate: 1.5,
  });

  return {
    winSFX,
    tapSFX,
    stepSFX,
    tickSFX,
    clickSFX,
  };
};
