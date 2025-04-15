import Sidebar from "./components/sideBar";
import "./globals.css";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark h-full w-full">
      <body className="h-full w-full overflow-hidden">
        <div className="flex h-screen w-screen overflow-hidden bg-apt-gradient bg-[#09090B]">
          <Sidebar />
          <div className="flex-1 min-w-0 min-h-0 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
