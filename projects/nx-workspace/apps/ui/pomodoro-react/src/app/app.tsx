import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import {
  PomodoroEngine,
  PomodoroUtilityContent,
} from '@vigilant-broccoli/react-utility';

export function App() {
  return (
    <ThemeProvider>
      <PomodoroEngine />
      <main className="flex min-h-dvh items-center justify-center bg-background p-4 text-foreground">
        <PomodoroUtilityContent />
      </main>
    </ThemeProvider>
  );
}
export default App;
