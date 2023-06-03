import { useUser } from '@clerk/nextjs';
import { type NextPage } from 'next';
import Head from 'next/head';
import { api } from '~/utils/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { LoadingPage } from '~/components/ui/loading';
import { useState } from 'react';
import { toast, useToast } from '~/components/use-toast';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '~/components/ui/scroll-area';
import { PostView } from '~/components/postview';

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
            void ctx.posts.getInfinitePosts.invalidate();
            toast({ title: 'Success!', description: 'Пост успешно создан' });
        },
        onError: (error) => {
            const errorMesage = error.data?.zodError?.fieldErrors.content;

            if (errorMesage && errorMesage[0]) {
                toast({ title: 'Error!', description: errorMesage[0] });
            } else {
                toast({
                    title: 'Error!',
                    description: 'Ошибка в создании поста',
                });
            }
        },
    });

    const sendPost = () => {
        mutate({ content: inputValue });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        sendPost();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Создать пост</CardTitle>
                <CardDescription>
                    Создайте пост, чтобы его все видели!
                </CardDescription>
                <CardContent className="flex items-center gap-2 p-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        type="text"
                        placeholder="Ваш текст"
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
                                'Подтвердить'
                            )}
                        </Button>
                    ) : (
                        <Button
                            disabled={true}
                            className={'cursor-not-allowed'}
                        >
                            Подтвердить
                        </Button>
                    )}
                </CardContent>
            </CardHeader>
        </Card>
    );
};

const Feed = () => {
    const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
    const { toast } = useToast();

    const ctx = api.useContext();

    const onSuccess = () => {
        toast({
            title: 'Success!',
            description: `Пост удален`,
        });
        void ctx.posts.getAll.invalidate();
    };

    if (postsLoading) return <LoadingPage />;

    if (!data) return <h1>No data</h1>;

    return (
        <ScrollArea className={'h-screen w-full rounded-md border'}>
            <div className="p-4">
                <h1>Посты</h1>
                {data.map((fullpost) => (
                    <PostView
                        key={fullpost.post.id}
                        {...fullpost}
                        onSuccess={onSuccess}
                    />
                ))}
            </div>
        </ScrollArea>
    );
};

const NewPostsFeed = () => {
    const {
        data: postsData,
        fetchNextPage,
        isLoading: isPostsLoading,
    } = api.posts.getInfinitePosts.useInfiniteQuery(
        {
            limit: 5,
        },
        {
            getNextPageParam: (lastPage) => {
                return lastPage.nextCursor;
            },
        },
    );

    const ctx = api.useContext();

    const loadMore = () => {
        void fetchNextPage();
    };

    const onSuccess = () => {
        toast({
            title: 'Success!',
            description: `Пост удален`,
        });
        void ctx.posts.getInfinitePosts.invalidate();
    };

    if (isPostsLoading) return <LoadingPage />;

    if (!postsData) return <h1>No data</h1>;

    return (
        <div className="rounded-md border p-4">
            {postsData.pages.map((page) => (
                <div key={page.nextCursor}>
                    {page.posts.map((item) => (
                        <PostView
                            key={item.post.id}
                            {...item}
                            onSuccess={onSuccess}
                        />
                    ))}
                </div>
            ))}
            <div className="flex w-full items-center justify-center">
                <Button
                    onClick={loadMore}
                    disabled={isPostsLoading}
                    variant={'outline'}
                    className="mt-2"
                >
                    Загрузить еще
                </Button>
            </div>
        </div>
    );
};

const Home: NextPage = () => {
    const { isLoaded: userLoaded } = useUser();
    if (!userLoaded) return <div />;

    return (
        <>
            <Head>
                <title>Chichirp</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="space-y-4">
                <CreatePostWizard />
                <NewPostsFeed />
            </main>
        </>
    );
};

export default Home;
