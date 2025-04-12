"use client";

import Link from "next/link";
import { useState } from "react";

const menuItems = [
  { label: "Championnat APT", icon: "emoji_events", href: "/championnat-apt" },
  {
    label: "Championnat Sit&Go",
    icon: "sports_esports",
    href: "/championnat-sitgo"
  },
  { label: "Super finale", icon: "star", href: "/super-finale" },
  { label: "Tournoi de l'AG", icon: "emoji_events", href: "/tournoi-ag" },
  { label: "SoliPoker", icon: "layers", href: "/solipoker" },
  { label: "Mallettes", icon: "card_giftcard", href: "/mallettes" },
  { label: "Joueurs", icon: "people", href: "/joueurs" }
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`flex flex-col justify-between ${
        collapsed ? "w-16" : "w-64"
      } h-screen bg-black/20 text-white transition-all duration-300`}>
      <div>
        <div
          className={`flex ${
            collapsed ? "flex-col gap-2" : ""
          } items-center justify-between p-4`}>
          <img src="/images/white_logo.svg" alt="Logo" className="h-8 w-8" />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white">
            <span className="material-icons">
              {collapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>
        </div>

        <nav className="space-y-1 mt-6">
          {menuItems.map(({ label, icon, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-4 px-4 py-2 hover:bg-white/10 transition-colors rounded">
              <span className="material-icons text-lg">{icon}</span>
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm bg-white/10 rounded px-3 py-2 hover:bg-white/20">
          <span className="material-icons rotate-180">logout</span>
          {!collapsed && <span>Retour au site</span>}
        </Link>
      </div>
    </div>
  );
}
