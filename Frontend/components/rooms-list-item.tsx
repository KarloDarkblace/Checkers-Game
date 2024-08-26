import { cn } from "@/lib/utils";
import { FC } from "react";

interface RoomsListItemProps {
  className?: string;
  firstCol: string;
  secondCol: string;
}

export const RoomsListItem: FC<RoomsListItemProps> = ({ className, firstCol, secondCol }) => {
  const style = "flex-[2_1] flex justify-center py-1";

  return (
    <div className={cn(className, "w-full flex border-b-2 border-gray-200")}>
      <div className={style}>{firstCol}</div>
      <div className={style}>{secondCol}</div>
    </div>
  );
};
