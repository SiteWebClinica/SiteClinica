"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("user")) { router.replace("/login"); return; }
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [router]);

  if (!ready) return <div className="min-h-screen grid place-items-center bg-[#f5f7fa]"><div className="flex flex-col items-center gap-3 text-sm text-slate-500"><span className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />Preparando seu painel</div></div>;

  return <div className="min-h-screen bg-[#f5f7fa]">
    <Sidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    <div className="lg:pl-72">
      <Header onMenuClick={() => setMenuOpen(true)} />
      <main className="min-h-[calc(100vh-4.5rem)] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
    </div>
  </div>;
}
