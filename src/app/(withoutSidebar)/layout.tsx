import "../globals.css";

export default function GameLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark bg-neutral-950 h-full w-full">
      <body>
          {children}
      </body>
    </html>
  );
}
