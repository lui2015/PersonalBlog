"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const socialLinks = [
  { name: "GitHub", href: "https://github.com", icon: "⟨/⟩" },
  { name: "Bilibili", href: "https://bilibili.com", icon: "▶" },
  { name: "Email", href: "mailto:hello@example.com", icon: "✉" },
];

export default function Footer() {
  const router = useRouter();

  const handleBrandDoubleClick = () => {
    router.push("/admin/login");
  };

  return (
    <footer className="relative border-t border-cyber-border bg-cyber-black/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p
              onDoubleClick={handleBrandDoubleClick}
              title="双击进入管理"
              className="font-[family-name:var(--font-orbitron)] text-sm text-cyber-blue cursor-default select-none hover:text-cyber-purple transition-colors"
            >
              鲁力铭
            </p>
            <p className="text-xs text-gray-500 mt-1">
              © {new Date().getFullYear()} All Rights Reserved
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {socialLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                target="_blank"
                className="w-10 h-10 flex items-center justify-center border border-cyber-border rounded text-gray-400 hover:text-cyber-blue hover:border-cyber-blue hover:shadow-[0_0_10px_var(--color-cyber-blue)] transition-all duration-300"
                title={link.name}
              >
                <span className="text-sm">{link.icon}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-cyber-border/30 text-center">
          <p className="text-xs text-gray-600 font-[family-name:var(--font-mono)]">
            {"// POWERED BY NEXT.JS | DESIGNED WITH <CYBER_AESTHETICS>"}
          </p>
        </div>
      </div>
    </footer>
  );
}
