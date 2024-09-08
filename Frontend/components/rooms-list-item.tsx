import { cn } from "@/lib/utils";
import { FC } from "react";

interface RoomsListItemProps {
  id?: number;
  isChosen?: boolean;
  className: string;
  firstCol: string;
  secondCol: string;
  setChosenRoom?: (id: number) => void;
}

export const RoomsListItem: FC<RoomsListItemProps> = ({
  id,
  isChosen,
  className,
  firstCol,
  secondCol,
  setChosenRoom,
}) => {
  const style = "flex-[2_1] flex justify-center py-1";
  const bgStyle = isChosen ? "bg-gray-200" : "";

  return (
    <div
      className={cn(
        className,
        bgStyle,
        "w-full flex border-b-2 border-gray-200 cursor-auto select-none"
      )}
      onClick={setChosenRoom && id ? () => setChosenRoom(id) : undefined}
    >
      <div className={style}>{firstCol}</div>
      <div className={style}>{secondCol}</div>
    </div>
  );
};
