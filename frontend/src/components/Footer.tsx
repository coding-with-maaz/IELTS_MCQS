import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold">ABS IELTS</span>
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{' '}
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Your Name
            </a>
            . The source code is available on{' '}
            <a
              href="https://github.com/yourusername/ielts-lab"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <nav className="flex items-center space-x-6 text-sm">
            <Link
              to="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Contact
            </Link>
            <Link
              to="/privacy"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
