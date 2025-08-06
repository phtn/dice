import Image from "next/image";
import { useIsMobile } from "@/lib/hooks/use-mobile";

export const NavLogo = () => {
  const isMobile = useIsMobile();
  return (
    <div>
      {isMobile ? (
        <Image
          alt="logo"
          width={0}
          height={0}
          src={"/69.svg"}
          className="aspect-auto h-7 w-auto"
        />
      ) : (
        <Image
          alt="logo"
          width={0}
          height={0}
          src={"/bet69.svg"}
          className="aspect-auto h-7 w-auto"
        />
      )}
    </div>
  );
};
