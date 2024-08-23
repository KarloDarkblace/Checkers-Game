import { cn } from "@/lib/utils";
import { FC } from "react";

interface RoomsListItemProps {
  className?: string;
  firstCol: string;
  secondCol: string;
}

export const RoomsListItem: FC<RoomsListItemProps> = ({ className, firstCol, secondCol }) => {
  return (
    <div className={cn(className, "w-full flex")}>
      <div className="flex-[2_1] flex justify-center">{firstCol}</div>
      <div className="flex-[1_1] flex justify-center">{secondCol}</div>
    </div>
  );
};
