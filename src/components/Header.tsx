import { Keyboard as KeyboardIcon } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b py-4 px-6 bg-card shadow-sm">
      <div className="container mx-auto flex items-center gap-3">
        <KeyboardIcon className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">SheetLink Keyboard</h1>
      </div>
    </header>
  );
}
