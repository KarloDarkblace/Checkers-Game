"use client";

import { useSound } from "@/lib/hooks";
import { clearTempCheckers, cn } from "@/lib/utils";
import { FC, MouseEvent, useState } from "react";
import { Figures } from "./figures";

const initialField = [
  [0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 2, 0, 2, 0, 2, 0],
  [0, 2, 0, 2, 0, 2, 0, 2],
  [2, 0, 2, 0, 2, 0, 2, 0],
];
/*
0 - пустая
1 - белая
2 - черная
3 - белая королева
4 - черная королева
*/

const marginRow = [" ", "A", "B", "C", "D", "E", "F", "G", "H", " "];
const marginColumn = ["8", "7", "6", "5", "4", "3", "2", "1"];

const BL_CELL = "#769656";
const WH_CELL = "#ffcb87";

interface CheckerType {
  x: number;
  y: number;
  color: 1 | 2 | 9;
  isQueen: boolean;
}

export const Field: FC<{ fieldSize: number }> = ({ fieldSize }) => {
  const [field, setField] = useState(initialField);
  const [repeatMove, setRepeatMove] = useState(false);
  const [playerColor, setPlayerColor] = useState<1 | 2>(2);
  const [currentChecker, setCurrentChecker] = useState<CheckerType | null>(null);

  const playSound = useSound("/checker.mp3");

  const checkFreeMove = (x: number, y: number) => {
    if (y === 0) return;
    if (x > 0 && field[y - 1][x - 1] === 0) {
      field[y - 1][x - 1] = 9;
    }
    if (x < 7 && field[y - 1][x + 1] === 0) {
      field[y - 1][x + 1] = 9;
    }
  };

  const checkFreeQueenMove = (x: number, y: number) => {
    for (let i = 1; x - i >= 0 && y - i >= 0 && field[y - i][x - i] === 0; i++) {
      field[y - i][x - i] = 9;
    }
    for (let i = 1; x + i <= 7 && y - i >= 0 && field[y - i][x + i] === 0; i++) {
      field[y - i][x + i] = 9;
    }
    for (let i = 1; x - i >= 0 && y + i <= 7 && field[y + i][x - i] === 0; i++) {
      field[y + i][x - i] = 9;
    }
    for (let i = 1; x + i <= 7 && y + i <= 7 && field[y + i][x + i] === 0; i++) {
      field[y + i][x + i] = 9;
    }
  };

  const checkFightMove = (x: number, y: number): boolean => {
    const enemyColor = playerColor === 1 ? 2 : 1;
    let isFighting = false;

    if (field[y - 1][x - 1] === enemyColor && y - 2 >= 0 && field[y - 2][x - 2] === 0) {
      field[y - 2][x - 2] = 9;
      isFighting = true;
    }
    if (field[y - 1][x + 1] === enemyColor && y - 2 >= 0 && field[y - 2][x + 2] === 0) {
      field[y - 2][x + 2] = 9;
      isFighting = true;
    }
    if (y < 6 && field[y + 1][x - 1] === enemyColor && field[y + 2][x - 2] === 0) {
      field[y + 2][x - 2] = 9;
      isFighting = true;
    }
    if (y < 6 && field[y + 1][x + 1] === enemyColor && field[y + 2][x + 2] === 0) {
      field[y + 2][x + 2] = 9;
      isFighting = true;
    }
    return isFighting;
  };

  const checkFightQueenMove = (x: number, y: number): boolean => {
    const enemyColor = playerColor === 1 ? 2 : 1;
    let isFighting = false;
    let firstCheck = false;

    let i = 1;
    while (y - i >= 0 && x - i >= 0) {
      if (field[y - i][x - i] === playerColor) break;
      if (field[y - i][x - i] === 0) field[y - i][x - i] = 9;
      if (field[y - i][x - i] === enemyColor) {
        if (!firstCheck && y - i > 0 && field[y - i - 1][x - i - 1] === 0) {
          clearTempCheckers(field);
          firstCheck = true;
          isFighting = true;
        } else {
          break;
        }
      }
      i++;
    }
    return isFighting;
  };

  const checkNextMove = (x: number, y: number, isQueen: boolean) => {
    if (isQueen) {
      if (!checkFightQueenMove(x, y)) checkFreeQueenMove(x, y);
    } else {
      if (!checkFightMove(x, y)) checkFreeMove(x, y);
    }
    // checkMove(x, y);
  };

  const onClickHandler = (e: MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / 8));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / 8));

    if (!currentChecker && field[y][x] === 0) {
      return;
    }
    if (field[y][x] === playerColor) {
      clearTempCheckers(field);
      setCurrentChecker({ x, y, color: field[y][x] as CheckerType["color"], isQueen: true });
      checkNextMove(x, y, true); // проверка дамки
      setField([...field]);
      return;
    }
    if (currentChecker && field[y][x] === 9) {
      clearTempCheckers(field); // придет с сервера, не нужно очищать
      field[currentChecker.y][currentChecker.x] = 0;
      field[y][x] = currentChecker.color;
      setField([...field]);
      setCurrentChecker(null);
      playSound();
    }
  };

  const drawField = () => {
    return field.map((row, y) => {
      return row.map((_, x) => {
        const color = (x + y) % 2 ? BL_CELL : WH_CELL;
        return <div key={`${x}${y}`} style={{ backgroundColor: color }}></div>;
      });
    });
  };

  const asideStyle = "flex bg-black text-white text-2xl justify-around items-center text-center";

  const drawMarginRow = (keyAdd: string) => {
    return (
      <div
        className={cn(
          asideStyle,
          fieldSize < 600
            ? "h-8 grid grid-cols-[2rem_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_2rem] text-lg"
            : "h-12 grid grid-cols-[3rem_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_3rem]"
        )}
      >
        {marginRow.map((row, i) => (
          <div key={row + keyAdd + i}>{row}</div>
        ))}
      </div>
    );
  };

  const drawMarginColumn = (keyAdd: string) => {
    return (
      <div
        className={cn(
          asideStyle,
          fieldSize < 600 ? "w-8 text-lg" : "w-12",
          "grid grid-rows-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
        )}
      >
        {marginColumn.map((row) => (
          <div key={row + keyAdd}>{row}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col shadow-[0_0_50px] shadow-slate-500">
      {drawMarginRow("top")}
      <div className="flex">
        {drawMarginColumn("left")}
        <div
          className={"relative grid grid-cols-8 grid-rows-8 aspect-square"}
          style={{ height: fieldSize, width: fieldSize }}
          onClick={onClickHandler}
        >
          {drawField()}
          <Figures field={field} fieldSize={fieldSize} />
        </div>
        {drawMarginColumn("right")}
      </div>
      {drawMarginRow("bottom")}
    </div>
  );
};
