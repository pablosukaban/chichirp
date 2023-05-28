import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { Button } from '~/components/ui/button';

const Header = () => {
    const { isSignedIn, user, isLoaded: userLoaded } = useUser();

    const fallbackName = user?.username?.slice(0, 2);

    if (!userLoaded) return <div />;

    return (
        <header className="mb-4 py-6">
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
                            <DropdownMenuLabel>Профиль</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href={`/@${user.username}`}>
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    {user.username}
                                </DropdownMenuItem>
                            </Link>
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

export default Header;
