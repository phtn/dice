import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  return (
    <div className="flex justify-center w-screen overflow-hidden">
      <div className="h-12 flex justify-between rounded-md m-1 px-2 md:px-4 items-center w-full">
        <div>
          <Image
            alt="logo"
            width={0}
            height={0}
            src={"/bet69.svg"}
            className="aspect-auto h-7 w-auto"
          />
        </div>
        <div className="text-zinc-500 font-redhat tracking-tight">
          <Link href={"/blackjack"}>blackjack</Link>
        </div>
      </div>
    </div>
  );
};
