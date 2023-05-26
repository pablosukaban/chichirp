import { SignInButton, useUser } from '@clerk/nextjs';
import { type NextPage } from 'next';
import Head from 'next/head';
import { type RouterOutputs, api } from '~/utils/api';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';
import { LoadingPage } from '~/components/loading';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
    const [inputValue, setInputValue] = useState('');

    const { user } = useUser();

    const ctx = api.useContext();

    const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
        onSuccess: () => {
            setInputValue('');
            void ctx.posts.getAll.invalidate();
        },
        onError: (error) => {
            const errorMesage = error.data?.zodError?.fieldErrors.content;

            if (errorMesage && errorMesage[0]) {
                toast.error(errorMesage[0]);
            } else {
                toast.error('Failed to create post');
            }
        },
    });

    const sendPost = () => {
        mutate({ content: inputValue });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;

        if (inputValue.length === 0) {
            toast.error('Post cannot be empty');
            return;
        }

        sendPost();
    };

    if (!user) return null;

    return (
        <div className="flex w-full items-center justify-between gap-4">
            <div className="flex w-full items-center gap-2">
                <Image
                    src={user.profileImageUrl}
                    alt="Profile Image"
                    className="h-20 w-20 rounded-full"
                    width={80}
                    height={80}
                />
                <input
                    className="grow bg-transparent p-4 outline-none focus:outline-none"
                    placeholder="Put some emoji"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isPosting}
                    onKeyDown={handleKeyDown}
                />
                {inputValue.length > 0 && (
                    <button
                        onClick={sendPost}
                        disabled={isPosting}
                        className="disabled:text-slate-600"
                    >
                        {isPosting ? 'Posting...' : 'Post'}
                    </button>
                )}
            </div>
            {/* <SignOutButton /> */}
        </div>
    );
};

type PostWithUser = RouterOutputs['posts']['getAll'][number];
const PostView = (props: PostWithUser) => {
    const { author, post } = props;

    return (
        <li
            key={post.id}
            className="flex items-center border-b border-slate-400 p-6 text-xl"
        >
            <div className="flex items-center gap-2">
                <Image
                    src={author.profileImageUrl}
                    className="h-16 w-16 rounded-full"
                    width={64}
                    height={64}
                    alt={`@${author.username}'s profile image`}
                />
                <div className="flex h-full flex-col justify-between gap-2">
                    <div>
                        <span className="text-slate-300">{`@${author.username}`}</span>
                        <span className="px-2 text-slate-400">·</span>
                        <span className="text-slate-400">{`${dayjs(
                            post.createdAt,
                        ).fromNow()}`}</span>
                    </div>
                    <span className="text-2xl">{post.content}</span>
                </div>
            </div>
        </li>
    );
};

const Feed = () => {
    const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

    if (postsLoading) return <LoadingPage />;

    if (!data) return <h1>No data</h1>;

    return (
        <ul className="flex flex-col">
            {data.map((fullPost) => (
                <PostView key={fullPost.post.id} {...fullPost} />
            ))}
        </ul>
    );
};

const Home: NextPage = () => {
    const { isLoaded: userLoaded, isSignedIn } = useUser();

    api.posts.getAll.useQuery();

    if (!userLoaded) return <div />;

    return (
        <>
            <Head>
                <title>Chichirp</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex min-h-screen justify-center p-4 text-lg">
                <div className="h-full w-full border-x md:max-w-2xl">
                    <div className="flex items-center justify-end border border-slate-400 p-8">
                        {!isSignedIn && (
                            <div>
                                <SignInButton />
                            </div>
                        )}
                        {!!isSignedIn && <CreatePostWizard />}
                    </div>
                    <Feed />
                </div>
            </main>
        </>
    );
};

export default Home;
