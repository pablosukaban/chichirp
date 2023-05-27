import { DropdownMenuItem } from '~/components/dropdown-menu';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { setTheme, theme: currentTheme } = useTheme();

    return (
        <>
            {currentTheme === 'light' ? (
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                </DropdownMenuItem>
            ) : (
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                </DropdownMenuItem>
            )}
        </>
    );
};

export default ThemeToggle;
