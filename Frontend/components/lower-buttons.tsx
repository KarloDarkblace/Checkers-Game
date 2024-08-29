"use client";

import { FC, useState } from "react";
import { IListItem } from "./rooms-list";

interface LowerButtonsProps {
  className?: string;
  chosenRoom: number;
  roomList: IListItem[];
  setRoomlist: (roomList: IListItem[]) => void;
}

export const LowerButtons: FC<LowerButtonsProps> = ({ chosenRoom, roomList, setRoomlist }) => {
  const [inputNickname, setInputNickname] = useState("");

  const createRoomHandler = () => {
    if (inputNickname)
      setRoomlist([...roomList, { id: roomList.length + 1, name: inputNickname, players: 0 }]);
  };

  const joinRoomHandler = () => {
    window.location.pathname = "/room/";
  };

  const buttonStyle =
    "bg-white p-2 rounded-lg font-bold active:scale-95 transition shadow-[0_0_50px] shadow-slate-500";

  return (
    <div className="flex w-full justify-between">
      <input
        className="bg-white p-2 rounded-lg outline-none"
        type="text"
        placeholder="Enter your nickname..."
        onChange={(e) => setInputNickname(e.target.value)}
      />
      <div className="flex gap-2">
        <button className={buttonStyle} onClick={createRoomHandler}>
          CREATE ROOM
        </button>
        <button className={buttonStyle} onClick={joinRoomHandler}>
          JOIN
        </button>
      </div>
    </div>
  );
};
