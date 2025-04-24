import { Divider } from "@heroui/react";
import Sidebar from "./components/sideBar";
import "./globals.css";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark bg-neutral-950 h-full w-full">
      <body className="h-full w-full overflow-hidden">
        <div className="flex h-screen w-screen overflow-hidden">
          <Sidebar />
          <Divider orientation="vertical" className="border-2" />
          <div className="flex-1 min-w-0 min-h-0 overflow-y-auto p-6 bg-apt-gradient">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
