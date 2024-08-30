import { FC } from "react";

interface FiguresProps {
  fieldSize: number;
  field: number[][];
}

const BL_IN = "#333";
const BL_OUT = "black";
const WH_IN = "#ccc";
const WH_OUT = "white";

export const Figures: FC<FiguresProps> = ({ fieldSize, field }) => {
  const cellSize = fieldSize / 8;
  const checkerSize = cellSize * 0.7;
  return (
    <div className="absolute w-full h-full grid grid-cols-8 grid-rows-8">
      {field.map((row, y) => {
        return row.map((cell, x) => {
          if (cell === 0) {
            return null;
          }
          const outerColor = cell === 2 || cell === 9 ? BL_OUT : WH_OUT;
          const innerColor = cell === 2 || cell === 9 ? BL_IN : WH_IN;

          return (
            <div
              key={`checkers-${x}${y}`}
              className={`absolute rounded-full flex items-center justify-center`}
              style={{
                opacity: cell === 9 ? 0.2 : 1,
                border: `${checkerSize * 0.15}px solid ${outerColor}`,
                backgroundColor: innerColor,
                left: cellSize * x + cellSize / 2 - checkerSize / 2,
                top: cellSize * y + cellSize / 2 - checkerSize / 2,
                width: checkerSize,
                height: checkerSize,
              }}
            ></div>
          );
        });
      })}
    </div>
  );
};
