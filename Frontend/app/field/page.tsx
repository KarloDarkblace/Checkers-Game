"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";

const initialField = [
  ["", "w", "", "w", "", "w", "", "w"],
  ["w", "", "", "", "w", "", "w", ""],
  ["", "w", "", "w", "", "", "", "w"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["b", "", "b", "", "b", "", "b", ""],
  ["", "b", "", "b", "", "b", "", "b"],
  ["b", "", "b", "", "b", "", "b", ""],
];
const SIZE = 800;
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
}

export default function Field() {
  const cellSize = SIZE / 8;
  const checkerSize = cellSize * 0.7;

  const [field, setField] = useState(initialField);
  const [repeatMove, setRepeatMove] = useState(false);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("b");
  const [currentCoords, setCurrentCoords] = useState<CheckerType | undefined>();

  const checkMove = (x: number, y: number) => {
    if (x > 0 && field[y - 1][x - 1] === "") {
      field[y - 1][x - 1] = "t";
    }
    if (x < 7 && field[y - 1][x + 1] === "") {
      field[y - 1][x + 1] = "t";
    }
  };

  const checkFight = (x: number, y: number) => {
    const enemyColor = playerColor === "w" ? "b" : "w";
    if (y === 0) return;
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
    if (!isFighting) checkMove(x, y);
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

    if (!currentCoords && field[y][x] === "") {
      return;
    }
    if (field[y][x] === playerColor) {
      // if (field[y][x] === playerColor) {
      clearTempCheckers();
      setCurrentCoords({ x, y, color: field[y][x] as CheckerType["color"] });
      checkFight(x, y);
      setField([...field]);
      return;
    }
    if (currentCoords && field[y][x] === "t") {
      clearTempCheckers(); // придет с сервера, не нужно очищать
      field[currentCoords.y][currentCoords.x] = "";
      field[y][x] = currentCoords.color;
      setField([...field]);
      setCurrentCoords(undefined);
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
                  opacity: cell === "t" ? 0.3 : 1,
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
    <div className="w-screen h-screen flex items-center justify-center">
      <div
        className={`relative grid grid-cols-8 grid-rows-8`}
        style={{ height: SIZE, width: SIZE }}
        onClick={onClickHandler}
      >
        {drawField()}
        {drawFigures()}
      </div>
    </div>
  );
}
