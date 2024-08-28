"use client";

import { Chat } from "@/components/chat";
import { Field } from "@/components/field";
import { useEffect, useState } from "react";

export default function Room() {
  const [fieldSize, setFieldSize] = useState(0);
  const [isVertical, setIsVertical] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fieldSizeCalc = () => {
      let size = 0;
      if (window.innerWidth > 768 && window.innerHeight > 768) {
        size = 600;
      } else if (window.innerWidth > 550 && window.innerHeight > 550) {
        size = 500;
      } else if (window.innerWidth > 450 && window.innerHeight > 450) {
        size = 400;
      } else {
        size = 300;
      }
      if (window.innerWidth < 1280) {
        if (!isVertical) setIsVertical(true);
      } else {
        if (isVertical) setIsVertical(false);
      }
      return size;
    };
    setFieldSize(fieldSizeCalc());

    const handleResize = () => {
      const size = fieldSizeCalc();
      setFieldSize(size);
    };
    window.addEventListener("resize", handleResize);

    setIsLoading(true);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isVertical]);

  return (
    <>
      {isLoading && (
        <div
          className={`w-screen h-screen ${
            isVertical ? "flex flex-col" : "flex"
          } items-center justify-center gap-10`}
        >
          <Chat fieldSize={fieldSize} isVertical={isVertical} />
          <Field fieldSize={fieldSize} />
        </div>
      )}
    </>
  );
}
