import { Moon, Sun } from 'lucide-react';
import { IconToggleButton } from '@/components/ui/IconToggleButton';
import { useUIStore } from '@/stores/uiStore';

// Define the state type expected by the store selectors
interface UIState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  // Use selectors with explicit state type
  const isDarkMode = useUIStore((state: UIState) => state.isDarkMode);
  const toggleDarkMode = useUIStore((state: UIState) => state.toggleDarkMode);

  return (
    <IconToggleButton
      buttonProps={{
        variant: 'ghost',
        size: 'icon',
        className: 'h-8 w-8',
        children: <span className="sr-only">Toggle theme</span>,
      }}
      className={className}
      icon1={Moon}
      icon2={Sun}
      isIcon2Showing={isDarkMode}
      onClick={toggleDarkMode}
    />
  );
}
