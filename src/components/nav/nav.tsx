import Image from "next/image";

export const Navbar = () => {
  return (
    <div className="flex justify-center w-screen overflow-hidden">
      <div className="h-12 flex justify-between rounded-md m-1 px-2 items-center w-full">
        <div>
          <Image
            alt="logo"
            width={0}
            height={0}
            src={"/bet69.svg"}
            className="aspect-auto h-7 w-auto"
          />
        </div>
      </div>
    </div>
  );
};
