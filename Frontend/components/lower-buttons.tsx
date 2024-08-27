"use client";

import { FC } from "react";

interface LowerButtonsProps {
  className?: string;
}

export const LowerButtons: FC<LowerButtonsProps> = ({ className }) => {
  const buttonStyle =
    "bg-white p-2 rounded-lg font-bold active:scale-95 transition shadow-[0_0_50px] shadow-slate-500";

  return (
    <div className="flex w-full justify-between">
      <input
        className="bg-white p-2 rounded-lg outline-none"
        type="text"
        placeholder="Enter your nickname..."
      />
      <div className="flex gap-2">
        <button className={buttonStyle}>CREATE ROOM</button>
        <button className={buttonStyle}>JOIN</button>
      </div>
    </div>
  );
};
