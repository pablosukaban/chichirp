import { ClerkProvider } from '@clerk/nextjs';
import { type AppType } from 'next/app';
import { api } from '~/utils/api';
import '~/styles/globals.css';
import { Toaster } from '~/components/ui/toaster';
import { ThemeProvider } from '~/components/theme-provider';
import Header from '~/components/Header';
import Footer from '~/components/Footer';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const MyApp: AppType = ({ Component, pageProps }) => {
    return (
        <ClerkProvider {...pageProps}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <Toaster />
                <div
                    className={`container flex min-h-screen max-w-5xl flex-col justify-between ${inter.className}`}
                >
                    <Header />
                    <Component {...pageProps} />
                    <Footer />
                </div>
            </ThemeProvider>
        </ClerkProvider>
    );
};

export default api.withTRPC(MyApp);
