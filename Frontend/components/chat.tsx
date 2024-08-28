"use client";

import { useSocket } from "@/lib/hooks";
import { FC, useEffect, useState } from "react";

export const Chat: FC<{ fieldSize: number; isVertical: boolean }> = ({ fieldSize, isVertical }) => {
  const socket = useSocket();
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket?.on("connect", () => {
      console.log("Connected");
    });

    socket?.emit("message", message);
  });

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${isVertical ? "" : ""}`}
      style={{ width: fieldSize * 0.8, height: fieldSize * 0.8 }}
    >
      <div className="text-white flex justify-center items-center">
        <span className="text-3xl font-bold">CHAT</span>
      </div>
      <div className="relative bg-white rounded flex-grow w-full">
        <input
          type="text"
          className="border-2 w-full px-4 bottom-0 absolute"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message..."
        />
      </div>
    </div>
  );
};
