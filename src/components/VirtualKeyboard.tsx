"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Keyboard as KeyboardIcon, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface VirtualKeyboardProps {
  keys: string[];
}

export function VirtualKeyboard({ keys }: VirtualKeyboardProps) {
  const { toast } = useToast();

  const handleKeyPress = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast({
        title: "Copied to Clipboard",
        description: `"${key}" has been copied.`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy text to clipboard. Your browser might not support this feature or permissions are denied.",
        variant: "destructive",
      });
      console.error('Failed to copy: ', err);
    }
  };

  if (keys.length === 0) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <KeyboardIcon className="h-6 w-6 text-primary" />
            Custom Keyboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Select cells from the spreadsheet to create your custom keyboard.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <KeyboardIcon className="h-6 w-6 text-primary" />
          Custom Keyboard
        </CardTitle>
        <CardDescription>Click a key to copy its content to your clipboard.</CardDescription>
      </CardHeader>
      <CardContent className="bg-card p-4 rounded-b-lg">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {keys.map((key, index) => (
            <Button
              key={index}
              onClick={() => handleKeyPress(key)}
              variant="secondary"
              className="h-16 text-sm font-medium text-foreground bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground active:bg-primary active:text-primary-foreground transition-all duration-100 ease-in-out transform active:scale-95 shadow-md overflow-hidden p-2"
              aria-label={`Copy ${key}`}
            >
              <span className="truncate block w-full text-center">{key}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
