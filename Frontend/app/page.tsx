import { RoomsList } from "@/components/rooms-list";

export default function Home() {
  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center gap-10">
      <div className="flex flex-col items-center">
        <span className="text-6xl font-bold">CHECKERS</span>
        <span className="text-4xl font-bold">ONLINE</span>
      </div>
      <RoomsList />
    </main>
  );
}
