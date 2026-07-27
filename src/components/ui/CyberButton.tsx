import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function CyberButton({ href, children, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={
        "inline-block px-4 py-2 text-xs font-[family-name:var(--font-orbitron)] border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 hover:shadow-[0_0_12px_var(--color-cyber-blue)] transition-all " +
        className
      }
    >
      {children}
    </Link>
  );
}
