import {
    ClerkProvider,
    SignInButton,
    SignOutButton,
    useUser,
} from '@clerk/nextjs';
import { type AppType } from 'next/app';
import { api } from '~/utils/api';
import '~/styles/globals.css';
import { Toaster } from '~/components/toaster';
import { ThemeProvider } from '~/components/theme-provider';
import Header from '~/components/Header';
import Footer from '~/components/Footer';

const MyApp: AppType = ({ Component, pageProps }) => {
    return (
        <ClerkProvider {...pageProps}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <Toaster />
                <Header />
                <Component {...pageProps} />
                <Footer />
            </ThemeProvider>
        </ClerkProvider>
    );
};

export default api.withTRPC(MyApp);
