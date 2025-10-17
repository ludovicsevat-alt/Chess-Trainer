import titre from "../assets/images/titre.png";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-900 text-white">
      <header className="py-4 flex flex-col items-center gap-2">
        <img
          src={titre}
          alt="Chess Trainer"
          className="h-24 w-auto drop-shadow-lg select-none pointer-events-none"
        />
        <h1 className="text-3xl font-semibold">Chess Trainer</h1>
      </header>

      <main className="flex-1 w-full flex items-center justify-center">{children}</main>

      <footer className="py-3 text-sm opacity-70">
        © {new Date().getFullYear()} Chess Trainer — Version IA 🎯
      </footer>
    </div>
  );
}
