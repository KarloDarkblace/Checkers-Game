"use client";

import { useSocket } from "@/lib/hooks";
import Image from "next/image";
import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";
import { MessagesList } from "./messages-list";

interface ChatProps {
  fieldSize: number;
  isVertical: boolean;
}

const messages = [
  { text: "Привет", date: "12:00", sender: "Me" },
  { text: "Привет!", date: "12:01", sender: "Ken" },
  { text: "Чо, как оно?", date: "12:02", sender: "Me" },
  { text: "Да норм", date: "12:03", sender: "Ken" },
];

export const Chat: FC<ChatProps> = ({ fieldSize, isVertical }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [messageList, setMessageList] = useState(messages);

  const messageListRef = useRef<HTMLDivElement | null>(null);

  const socket = useSocket();

  // useEffect(() => {
  //   socket?.on("connect", () => {
  //     console.log("Connected");
  //   });
  // });

  const send = (inputMessage: string) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          action: "send_message",
          room_id: "0",
          sender: "333",
          content: inputMessage,
        })
      );
    }
  };

  if (socket) {
    socket.onmessage = (e) => console.log(JSON.parse(e.data));
  }

  const sendMessage = () => {
    if (inputMessage) {
      send(inputMessage);

      setMessageList([
        ...messageList,
        {
          text: inputMessage,
          date: new Date().toLocaleTimeString("ru", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: "Me",
        },
      ]);
      setInputMessage("");
      setTimeout(() => {
        messageListRef.current?.scrollTo({
          top: messageListRef.current.scrollHeight,
        });
      }, 50);
    }
  };

  const keyDownHandler = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4`}
      style={{ width: fieldSize * 0.8, height: fieldSize }}
    >
      <div className="text-white flex justify-center items-center">
        <span className="text-3xl font-bold">ЧАТИК</span>
      </div>
      <div className="relative flex bg-white rounded-xl h-full w-full overflow-hidden shadow-[0_0_50px] shadow-slate-500">
        <div
          ref={messageListRef}
          className="w-full p-1 m-3 overflow-y-auto mb-[60px] flex flex-col gap-2"
        >
          <MessagesList messageList={messageList} />
        </div>
        <div className="flex bg-stone-200 bottom-0 w-full absolute justify-between items-center gap-3 px-3 py-2">
          <input
            type="text"
            className="border-2 h-9 px-3 flex-grow min-w-4 rounded-md focus:outline-none"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={keyDownHandler}
            placeholder="message..."
          />
          <button className="active:scale-95 transition" onClick={sendMessage}>
            <Image src={"/send.png"} alt="send" width={24} height={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
