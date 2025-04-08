import SideBar from "../components/sideBar";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row">
      <SideBar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
