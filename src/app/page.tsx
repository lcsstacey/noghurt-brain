import { C } from '@/styles/palette';

export default function Page() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: C.bg }}
    >
      <h1
        className="font-pixel text-glow text-3xl sm:text-5xl md:text-6xl text-center"
        style={{ color: C.pink }}
      >
        NOGHURT BRAIN
      </h1>
    </main>
  );
}
