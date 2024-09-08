import { cn } from "@/lib/utils";
import { FC } from "react";

interface IMessage {
  text: string;
  date: string;
  sender: string;
}

interface MessagesListProps {
  messageList: IMessage[];
}

export const MessagesList: FC<MessagesListProps> = ({ messageList }) => {
  return (
    <>
      {messageList.map((message, index) => {
        const messageAlignStyle = message.sender === "Me" ? "justify-end" : "justify-start";
        const messageColorStyle = message.sender === "Me" ? "bg-lime-50" : "bg-slate-100";
        return (
          <div className={cn(messageAlignStyle, "text-sm mr-2 flex")} key={message.text + index}>
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
    </>
  );
};
