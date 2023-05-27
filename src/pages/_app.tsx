import {
    ClerkProvider,
    SignInButton,
    SignOutButton,
    useUser,
} from '@clerk/nextjs';
import { type AppType } from 'next/app';
import { api } from '~/utils/api';
import '~/styles/globals.css';
import Link from 'next/link';
import { Button } from '~/components/button';
import { Toaster } from '~/components/toaster';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '~/components/dropdown-menu';
import { User, LogOut } from 'lucide-react';
import { ThemeProvider } from '~/components/theme-provider';
import ThemeToggle from '~/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/avatar';

const Header = () => {
    const { isSignedIn, user, isLoaded: userLoaded } = useUser();

    const fallbackName = user?.username?.slice(0, 2);

    if (!userLoaded) return <div />;

    return (
        <header className="container py-6">
            <nav className="flex items-center justify-between">
                <Link href="/" className="text-xl font-semibold">
                    Chichirp
                </Link>
                {isSignedIn && user.username ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="">
                            <Avatar className="">
                                <AvatarImage
                                    src={user.profileImageUrl}
                                    className="rounded-full"
                                />
                                <AvatarFallback>{fallbackName}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Profile</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href={`/@${user.username}`}>
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    {user.username}
                                </DropdownMenuItem>
                            </Link>
                            <ThemeToggle />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <LogOut className="mr-2 h-4 w-4" />
                                <SignOutButton />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button asChild>
                        <SignInButton />
                    </Button>
                )}
            </nav>
        </header>
    );
};

const MyApp: AppType = ({ Component, pageProps }) => {
    return (
        <ClerkProvider {...pageProps}>
            <ThemeProvider attribute="class" defaultTheme="light">
                <Toaster />
                <Header />
                <Component {...pageProps} />
            </ThemeProvider>
        </ClerkProvider>
    );
};

export default api.withTRPC(MyApp);
