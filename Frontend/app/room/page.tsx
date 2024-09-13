"use client";

import { Chat } from "@/components/chat";
import { Field } from "@/components/field";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Room() {
  const [fieldSize, setFieldSize] = useState(0);
  const [isVertical, setIsVertical] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpened, setIsChatOpened] = useState(false);

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isChatOpened && e.key === "Escape") setIsChatOpened(false);
    };
    document.addEventListener("keydown", handler);

    return () => document.removeEventListener("keydown", handler);
  }, [isChatOpened]);

  const title = () => {
    return (
      <div
        className={cn(
          isVertical ? "text-3xl" : "text-5xl",
          "absolute top-0 mt-5 text-white font-bold"
        )}
      >
        CHECKER ONLINE
      </div>
    );
  };

  return (
    <>
      {isLoading && (
        <div
          className={cn(
            isVertical ? "flex flex-col" : "flex",
            "w-screen h-screen items-center justify-center gap-10"
          )}
        >
          {isVertical ? (
            <>
              {title()}
              <Field fieldSize={fieldSize} />
              <div
                className={cn(
                  isChatOpened ? "left-0" : "left-[-3000px]",
                  "fixed w-screen h-screen bg-neutral-800 flex pt-3 justify-center overflow-hidden transition-all duration-300"
                )}
              >
                <Chat fieldSize={fieldSize} isVertical={isVertical} />
              </div>
              <button
                className="absolute bottom-3 right-3 text-white focus:outline-none"
                onClick={() => setIsChatOpened(!isChatOpened)}
              >
                <Image
                  width={40}
                  height={40}
                  priority={true}
                  src={isChatOpened ? "/back.png" : "/chat.png"}
                  alt="chat"
                />
              </button>
            </>
          ) : (
            <>
              <div>
                {title()}
                <Chat fieldSize={fieldSize} isVertical={isVertical} />
              </div>
              <Field fieldSize={fieldSize} />
            </>
          )}
        </div>
      )}
    </>
  );
}
