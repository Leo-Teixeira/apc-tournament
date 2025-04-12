import SideBar from "./components/sideBar";
import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body>
        <SideBar />
        <Providers>
          <div className="flex-1 p-6 bg-slate-500">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
