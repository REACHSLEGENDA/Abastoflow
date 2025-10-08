import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const themes = [
  { name: "zinc", color: "hsl(240 5.9% 10%)" },
  { name: "rose", color: "hsl(346.8 77.2% 49.8%)" },
  { name: "green", color: "hsl(142.1 76.2% 36.3%)" },
  { name: "orange", color: "hsl(24.6 95% 53.1%)" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [colorTheme, setColorTheme] = useState(() => localStorage.getItem("color-theme") || "zinc");

  useEffect(() => {
    const body = document.body;
    body.classList.remove(...themes.map(t => `theme-${t.name}`));
    if (colorTheme !== "zinc") {
      body.classList.add(`theme-${colorTheme}`);
    }
    localStorage.setItem("color-theme", colorTheme);
  }, [colorTheme]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-muted-foreground">Personaliza la apariencia y el comportamiento de la aplicación.</p>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>
              Elige cómo quieres que se vea la aplicación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <Label className="font-semibold">Modo de Color</Label>
              <RadioGroup value={theme} onValueChange={setTheme} className="grid max-w-md grid-cols-1 gap-8 pt-2 sm:grid-cols-3">
                <div>
                  <Label className="[&:has([data-state=checked])>div]:border-primary">
                    <RadioGroupItem value="light" className="sr-only" />
                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Claro
                    </span>
                  </Label>
                </div>
                <div>
                  <Label className="[&:has([data-state=checked])>div]:border-primary">
                    <RadioGroupItem value="dark" className="sr-only" />
                    <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                      <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                        <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Oscuro
                    </span>
                  </Label>
                </div>
                <div>
                  <Label className="[&:has([data-state=checked])>div]:border-primary">
                    <RadioGroupItem value="system" className="sr-only" />
                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="space-y-2 rounded-sm bg-[#ecedef] p-2 dark:bg-slate-950">
                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm dark:bg-slate-800">
                          <div className="h-2 w-[80px] rounded-lg bg-[#ecedef] dark:bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef] dark:bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm dark:bg-slate-800">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef] dark:bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef] dark:bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm dark:bg-slate-800">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef] dark:bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef] dark:bg-slate-400" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Sistema
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label className="font-semibold">Tema de Color</Label>
              <div className="flex gap-2 pt-2">
                {themes.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setColorTheme(t.name)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2",
                      colorTheme === t.name ? "border-primary" : "border-transparent"
                    )}
                    style={{ backgroundColor: t.color }}
                  >
                    <span className="sr-only">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}