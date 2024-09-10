import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3010");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
};

export const useSound = (audioSource: string) => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    const context = new AudioContext();
    setAudioContext(context);

    fetch(audioSource)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
      .then((buffer) => setAudioBuffer(buffer))
      .catch((error) => console.error("Ошибка при загрузке звука:", error));

    return () => {
      context.close();
    };
  }, [audioSource]);

  const playSound = () => {
    if (audioContext && audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  };

  return playSound;
};
