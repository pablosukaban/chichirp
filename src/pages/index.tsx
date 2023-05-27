import { useUser } from '@clerk/nextjs';
import { type NextPage } from 'next';
import Head from 'next/head';
import { type RouterOutputs, api } from '~/utils/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';
import { LoadingPage } from '~/components/loading';
import { useState } from 'react';
import { toast, useToast } from '~/components/use-toast';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '~/components/card';
import { Input } from '~/components/input';
import { Button } from '~/components/button';
import { Loader2, X } from 'lucide-react';
import { Separator } from '~/components/separator';
import { ScrollArea } from '~/components/scroll-area';

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
    const [inputValue, setInputValue] = useState('');
    const { toast } = useToast();
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
                toast({ title: 'Error!', description: errorMesage[0] });
            } else {
                toast({
                    title: 'Error!',
                    description: 'Failed to create post',
                });
            }
        },
    });

    const sendPost = () => {
        if (!user) {
            toast({ title: 'Error', description: 'Log in first' });
            return;
        }
        mutate({ content: inputValue });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;

        if (inputValue.length === 0) {
            toast({ title: 'Error!', description: 'Post cannot be empty' });
            return;
        }

        sendPost();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Post</CardTitle>
                <CardDescription>
                    Create a post, using only the emoji you want!
                </CardDescription>
                <CardContent className="flex items-center gap-2 p-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        type="text"
                        placeholder="Your emoji"
                        onKeyDown={handleKeyDown}
                    />
                    {user ? (
                        <Button
                            disabled={isPosting}
                            onClick={sendPost}
                            className="grid place-items-center"
                        >
                            {isPosting ? (
                                <Loader2 className="mx-1 h-4 w-4 animate-spin" />
                            ) : (
                                'Post'
                            )}
                        </Button>
                    ) : (
                        <Button
                            disabled={true}
                            className={'cursor-not-allowed'}
                        >
                            Post
                        </Button>
                    )}
                </CardContent>
            </CardHeader>
        </Card>
    );
};

type PostWithUser = RouterOutputs['posts']['getAll'][number];
const PostView = (props: PostWithUser) => {
    const { author, post } = props;

    const ctx = api.useContext();

    const { mutate } = api.posts.delete.useMutation({
        onSuccess: () => {
            toast({
                title: 'Success!',
                description: `Post deleted`,
            });
            void ctx.posts.getAll.invalidate();
        },
        onError: (error) => {
            if (error.data?.code === 'TOO_MANY_REQUESTS') {
                toast({ title: 'Error!', description: 'Too many requests' });
                return;
            } else {
                toast({
                    title: 'Error!',
                    description: 'Failed to delete post',
                });
            }
        },
    });

    const deletePost = () => {
        mutate({ postId: post.id });
    };

    return (
        <div key={post.id}>
            <div
                className={'flex w-full items-center justify-between gap-4 p-4'}
            >
                <div className="flex gap-4">
                    <Image
                        src={author.profileImageUrl}
                        className="h-16 w-16 rounded-full"
                        width={64}
                        height={64}
                        alt={`@${author.username}'s profile image`}
                    />
                    <div className="flex h-full flex-col justify-between gap-2">
                        <div className={'flex flex-wrap'}>
                            <Link href={`/@${author.username}`}>
                                <span className="">{`@${author.username}`}</span>
                            </Link>
                            <span className="px-2 text-slate-400">·</span>
                            <Link href={`/post/${post.id}`}>
                                <span className="text-slate-400">{`${dayjs(
                                    post.createdAt,
                                ).fromNow()}`}</span>
                            </Link>
                        </div>
                        <span className="text-xl">{post.content}</span>
                    </div>
                </div>
                <X onClick={deletePost} />
            </div>
            <Separator />
        </div>
    );
};

const Feed = () => {
    const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

    if (postsLoading) return <LoadingPage />;

    if (!data) return <h1>No data</h1>;

    return (
        <ScrollArea className={'h-screen w-full rounded-md border'}>
            <div className="p-4">
                <h1>Posts</h1>
                {data.map((fullpost) => (
                    <PostView key={fullpost.post.id} {...fullpost} />
                ))}
            </div>
        </ScrollArea>
    );
};

const Home: NextPage = () => {
    const { isLoaded: userLoaded } = useUser();

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
                <div className="mx-auto h-full w-full max-w-3xl space-y-4">
                    <CreatePostWizard />
                    <Feed />
                </div>
            </main>
        </>
    );
};

export default Home;
