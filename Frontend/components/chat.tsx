import { FC } from "react";

export const Chat: FC<{ fieldSize: number; isVertical: boolean }> = ({ fieldSize, isVertical }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${isVertical ? "" : ""}`}
      style={{ width: fieldSize * 0.8, height: fieldSize * 0.8 }}
    >
      <div className="text-white flex justify-center items-center">
        <span className="text-3xl font-bold">CHAT</span>
      </div>
      <div className="bg-white rounded flex-grow w-full"></div>
    </div>
  );
};
