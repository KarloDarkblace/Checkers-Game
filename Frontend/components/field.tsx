"use client";

import { useSound } from "@/lib/hooks";
import { FC, MouseEvent, useState } from "react";

const initialField = [
  ["", "", "", "w", "", "w", "", "w"],
  ["w", "", "", "", "w", "", "w", ""],
  ["", "w", "", "w", "", "", "", "w"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["b", "", "b", "", "b", "", "b", ""],
  ["", "b", "", "b", "", "b", "", "b"],
  ["b", "", "b", "", "b", "", "b", ""],
];

const BL_IN = "#333";
const BL_OUT = "black";
const WH_IN = "#ccc";
const WH_OUT = "white";
const BL_CELL = "#769656";
const WH_CELL = "#ffcb87";

interface CheckerType {
  x: number;
  y: number;
  color: "w" | "b" | "t";
  isQueen: boolean;
}

export const Field: FC<{ fieldSize: number }> = ({ fieldSize }) => {
  const [field, setField] = useState(initialField);
  const [repeatMove, setRepeatMove] = useState(false);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("b");
  const [currentChecker, setCurrentChecker] = useState<CheckerType | null>(null);

  const playSound = useSound("/checker.mp3");

  const checkFreeMove = (x: number, y: number) => {
    if (y === 0) return;
    if (x > 0 && field[y - 1][x - 1] === "") {
      field[y - 1][x - 1] = "t";
    }
    if (x < 7 && field[y - 1][x + 1] === "") {
      field[y - 1][x + 1] = "t";
    }
  };

  const checkFreeQueenMove = (x: number, y: number) => {
    for (let i = 1; x - i >= 0 && y - i >= 0 && field[y - i][x - i] === ""; i++) {
      field[y - i][x - i] = "t";
    }
    for (let i = 1; x + i <= 7 && y - i >= 0 && field[y - i][x + i] === ""; i++) {
      field[y - i][x + i] = "t";
    }
    for (let i = 1; x - i >= 0 && y + i <= 7 && field[y + i][x - i] === ""; i++) {
      field[y + i][x - i] = "t";
    }
    for (let i = 1; x + i <= 7 && y + i <= 7 && field[y + i][x + i] === ""; i++) {
      field[y + i][x + i] = "t";
    }
  };

  const checkFightMove = (x: number, y: number): boolean => {
    const enemyColor = playerColor === "w" ? "b" : "w";
    let isFighting = false;

    if (field[y - 1][x - 1] === enemyColor && y - 2 >= 0 && field[y - 2][x - 2] === "") {
      field[y - 2][x - 2] = "t";
      isFighting = true;
    }
    if (field[y - 1][x + 1] === enemyColor && y - 2 >= 0 && field[y - 2][x + 2] === "") {
      field[y - 2][x + 2] = "t";
      isFighting = true;
    }
    if (y < 6 && field[y + 1][x - 1] === enemyColor && field[y + 2][x - 2] === "") {
      field[y + 2][x - 2] = "t";
      isFighting = true;
    }
    if (y < 6 && field[y + 1][x + 1] === enemyColor && field[y + 2][x + 2] === "") {
      field[y + 2][x + 2] = "t";
      isFighting = true;
    }
    return isFighting;
  };

  const checkFightQueenMove = (x: number, y: number): boolean => {
    const enemyColor = playerColor === "w" ? "b" : "w";
    let isFighting = false;
    let firstCheck = false;

    let i = 1;
    while (y - i >= 0 && x - i >= 0) {
      if (field[y - i][x - i] === playerColor) break;
      if (field[y - i][x - i] === "") field[y - i][x - i] = "t";
      if (field[y - i][x - i] === enemyColor) {
        if (!firstCheck && y - i > 0 && field[y - i - 1][x - i - 1] === "") {
          clearTempCheckers();
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

  const clearTempCheckers = () => {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (field[y][x] === "t") field[y][x] = "";
      }
    }
  };

  const onClickHandler = (e: MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / 8));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / 8));

    if (!currentChecker && field[y][x] === "") {
      return;
    }
    if (field[y][x] === playerColor) {
      clearTempCheckers();
      setCurrentChecker({ x, y, color: field[y][x] as CheckerType["color"], isQueen: true });
      checkNextMove(x, y, true); // проверка дамки
      setField([...field]);
      return;
    }
    if (currentChecker && field[y][x] === "t") {
      clearTempCheckers(); // придет с сервера, не нужно очищать
      field[currentChecker.y][currentChecker.x] = "";
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

  const drawFigures = () => {
    const cellSize = fieldSize / 8;
    const checkerSize = cellSize * 0.7;

    return (
      <div className="absolute w-full h-full grid grid-cols-8 grid-rows-8">
        {field.map((row, y) => {
          return row.map((cell, x) => {
            if (cell === "") {
              return null;
            }
            const outerColor = cell === "b" || cell === "t" ? BL_OUT : WH_OUT;
            const innerColor = cell === "b" || cell === "t" ? BL_IN : WH_IN;

            return (
              <div
                key={`checkers-${x}${y}`}
                className={`absolute rounded-full flex items-center justify-center`}
                style={{
                  opacity: cell === "t" ? 0.2 : 1,
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

  return (
    <div
      className={"relative grid grid-cols-8 grid-rows-8 aspect-square"}
      style={{ height: fieldSize, width: fieldSize }}
      onClick={onClickHandler}
    >
      {drawField()}
      {drawFigures()}
    </div>
  );
};
