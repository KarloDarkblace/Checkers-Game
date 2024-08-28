"use client";

import { LowerButtons } from "@/components/lower-buttons";
import { RoomsList } from "@/components/rooms-list";
import { useSocket } from "@/lib/hooks";
import Image from "next/image";
import { useEffect } from "react";

export default function Home() {
  const socket = useSocket();

  useEffect(() => {
    socket?.on("connect", () => {
      console.log("Connected");
    });

    socket?.on("message", () => {});

    socket?.emit("joinRoom", "XXX");
  });

  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center gap-10">
      <div className="flex flex-col  gap-4 justify-center items-center">
        <Image src="/log.svg" width={100} height={100} alt="logo" />
        <div className="flex flex-col items-center">
          <span className="text-6xl font-bold text-white">CHECKERS</span>
          <span className="text-4xl font-bold  text-white">ONLINE</span>
        </div>
      </div>
      <div className="flex flex-col w-[600px] gap-4">
        <RoomsList />
        <LowerButtons />
      </div>
    </main>
  );
}
