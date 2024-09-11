"use client";

import { RoomsList } from "@/components/rooms-list";
import { useSocket } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [imgSize, setImgSize] = useState(100);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const socket = useSocket();

  useEffect(() => {
    // socket?.on("connect", () => {
    //   console.log("Connected");
    // });
    // socket?.on("message", () => {});
    // socket?.emit("joinRoom", "XXX");
  });

  useEffect(() => {
    const isMobile = () => {
      let mobile = false;
      if (window.innerWidth < 768 || window.innerHeight < 768) {
        mobile = true;
      }
      return mobile;
    };
    const imgSizeCalc = () => {
      let size = 100;
      if (window.innerWidth < 768 || window.innerHeight < 768) {
        size = 70;
      }
      return size;
    };
    isMobile() ? setIsMobile(true) : setIsMobile(false);
    setImgSize(imgSizeCalc());
    const handleResize = () => {
      isMobile() ? setIsMobile(true) : setIsMobile(false);
      setImgSize(imgSizeCalc());
    };
    setIsLoading(true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {isLoading && (
        <main className="w-screen flex flex-col items-center justify-center gap-4 py-6">
          <div className="flex flex-col gap-2 md:gap-4 justify-center items-center mb-3">
            <Image src="/log.svg" width={imgSize} height={imgSize} alt="logo" />
            <div className="flex flex-col items-center font-bold text-white">
              <span className={isMobile ? "text-4xl" : " md:text-6xl"}>CHECKERS</span>
              <span className={isMobile ? "text-2xl" : " md:text-4xl"}>ONLINE</span>
            </div>
          </div>
          <div className={cn(isMobile ? "w-[95%]" : "w-[600px]", "flex flex-col gap-2 md:gap-4")}>
            <RoomsList isMobile={isMobile} />
          </div>
        </main>
      )}
    </>
  );
}
