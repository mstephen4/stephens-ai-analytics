import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} AI Olympiad</p>
      <nav aria-label="Legal">
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
    </footer>
  );
}
