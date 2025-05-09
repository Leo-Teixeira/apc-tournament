import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark bg-neutral-950 h-full w-full">
      <body className="h-full w-full overflow-hidden">
        {children}
      </body>
    </html>
  );
}

