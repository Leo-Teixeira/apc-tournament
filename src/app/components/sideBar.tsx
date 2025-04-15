"use client";

import { useState } from "react";
import Link from "next/link";
import { STRINGS } from "../constants/string";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Logout02Icon,
  SidebarLeft01Icon,
  SidebarLeftIcon,
  ViewIcon
} from "@hugeicons/core-free-icons";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? "w-16" : "w-64";

  return (
    <div
      className={`flex flex-col justify-between ${sidebarWidth} shrink-0 h-full bg-black/20 text-white transition-all duration-300`}>
      <div>
        <div
          className={`flex ${
            collapsed ? "flex-col gap-6" : "flex-row"
          } items-center justify-between p-4`}>
          <img src="/images/white_logo.svg" alt="Logo" className="h-8 w-8" />
          <button onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? (
              <HugeiconsIcon
                icon={SidebarLeftIcon}
                size={24}
                color="currentColor"
                strokeWidth={1.5}
              />
            ) : (
              <HugeiconsIcon
                icon={SidebarLeft01Icon}
                size={24}
                color="currentColor"
                strokeWidth={1.5}
              />
            )}
          </button>
        </div>

        <nav className="space-y-1 mt-6">
          {STRINGS.sidebar.menu_item.map(({ label, icon, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-4 px-4 py-2 hover:bg-white/10 transition-colors rounded">
              <HugeiconsIcon
                icon={icon}
                size={24}
                color="currentColor"
                strokeWidth={1.5}
              />
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm bg-white/10 rounded px-3 py-2 hover:bg-white/20">
          <HugeiconsIcon
            icon={Logout02Icon}
            size={24}
            color="currentColor"
            strokeWidth={1.5}
          />
          {!collapsed && <span>Retour au site</span>}
        </Link>
      </div>
    </div>
  );
}
