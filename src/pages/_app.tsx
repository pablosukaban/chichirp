import { ClerkProvider } from '@clerk/nextjs';
import { type AppType } from 'next/app';
import { api } from '~/utils/api';
import '~/styles/globals.css';
import { Toaster } from '~/components/ui/toaster';
import { ThemeProvider } from '~/components/theme-provider';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { ArrowBigUp } from 'lucide-react';

import { Inter } from 'next/font/google';
import { Button } from '~/components/ui/button';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
};

const MyApp: AppType = ({ Component, pageProps }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    console.log('🚀 ~ file: _app.tsx:25 ~ isScrolled:', isScrolled);

    const handleScroll = () => {
        setIsScrolled(window.scrollY > 0);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <ClerkProvider {...pageProps}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <Toaster />
                <div
                    className={`container relative flex min-h-screen max-w-5xl flex-col justify-between ${inter.className}`}
                >
                    <Header />
                    <Component {...pageProps} />
                    <Footer />
                    <Button
                        onClick={scrollToTop}
                        className={`${
                            isScrolled ? 'opacity-100' : 'opacity-0'
                        } fixed bottom-5 right-5 m-0 rounded-full p-2 transition-opacity duration-300`}
                        variant={'outline'}
                    >
                        <ArrowBigUp className="h-6 w-6 text-primary" />
                    </Button>
                </div>
            </ThemeProvider>
        </ClerkProvider>
    );
};

export default api.withTRPC(MyApp);
