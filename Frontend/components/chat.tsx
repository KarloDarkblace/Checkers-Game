"use client";

import { useSocket } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";

interface ChatProps {
  fieldSize: number;
  isVertical: boolean;
}

interface IMessage {
  text: string;
  date: string;
  sender: string;
}

const messages: IMessage[] = [
  { text: "Привет", date: "12:00", sender: "Me" },
  { text: "Привет!", date: "12:01", sender: "Ken" },
  { text: "Чо, как оно?", date: "12:02", sender: "Me" },
  { text: "Да норм", date: "12:03", sender: "Ken" },
];

export const Chat: FC<ChatProps> = ({ fieldSize, isVertical }) => {
  const socket = useSocket();
  const [inputMessage, setInputMessage] = useState("");
  const [messageList, setMessageList] = useState(messages);

  const messageListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    socket?.on("connect", () => {
      console.log("Connected");
    });
  });

  const sendMessage = () => {
    if (inputMessage) {
      socket?.emit("message", inputMessage);
      setMessageList([
        ...messageList,
        {
          text: inputMessage,
          date: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
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
      className={`flex flex-col items-center justify-center gap-4 ${isVertical ? "" : ""}`}
      style={{ width: fieldSize * 0.8, height: fieldSize * 0.8 }}
    >
      <div className="text-white flex justify-center items-center">
        <span className="text-3xl font-bold">CHAT</span>
      </div>
      <div className="relative flex bg-white rounded-xl h-[400px] w-full overflow-hidden shadow-[0_0_50px] shadow-slate-500">
        <div
          ref={messageListRef}
          className="w-full p-1 m-3 overflow-y-auto mb-[60px] flex flex-col gap-2"
        >
          {messageList.map((message, index) => {
            const messageAlignStyle = message.sender === "Me" ? "justify-end" : "justify-start";
            const messageColorStyle = message.sender === "Me" ? "bg-lime-50" : "bg-slate-100";
            return (
              <div
                className={cn(messageAlignStyle, "text-sm mr-2 flex")}
                key={message.text + index}
              >
                <div
                  className={cn(
                    messageColorStyle,
                    "relative max-w-[95%] p-2 box-border rounded-md shadow-md break-words"
                  )}
                >
                  <span className="pr-7">{message.text}</span>
                  <span className="absolute text-[70%] pl-2 bottom-1 right-1">{message.date}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex bg-stone-200 bottom-0 w-full absolute justify-between items-center gap-3 p-3">
          <input
            type="text"
            className="border-2 px-3 flex-grow min-w-4 rounded-md focus:outline-none"
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
