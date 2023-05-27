import React from 'react';
import ThemeToggle from '~/components/theme-toggle';
import { useUser } from '@clerk/nextjs';

const Footer = () => {
    const { isLoaded: userLoaded } = useUser();

    if (!userLoaded) return <div />;

    return (
        <footer className="container mt-4 max-w-4xl py-6">
            <div className={'flex w-full justify-between'}>
                <h1>
                    <span>Сделано с помощью </span>
                    <a
                        className={'hover:underline'}
                        href={'https://create.t3.gg/'}
                        target={'_blank'}
                    >
                        create-t3-app.
                    </a>
                    <span> Код доступен на </span>
                    <a
                        className={'hover:underline'}
                        href={'https://github.com/pablosukaban/chichirp'}
                        target={'_blank'}
                    >
                        GitHub.
                    </a>
                </h1>
                <ThemeToggle />
            </div>
        </footer>
    );
};

export default Footer;
