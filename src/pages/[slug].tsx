import { type GetStaticProps, type NextPage } from 'next';
import Head from 'next/head';
import { api } from '~/utils/api';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { PostView } from '~/components/postview';
import { ScrollArea } from '~/components/ui/scroll-area';
import { useToast } from '~/components/use-toast';
import { LoadingPage } from '~/components/ui/loading';
import { generateSSRHelper } from '~/server/helpers/ssgHelper';

dayjs.extend(relativeTime);

const ProfileFeed = (props: { userId: string }) => {
    const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
        userId: props.userId,
    });
    const { toast } = useToast();

    const ctx = api.useContext();

    const onSuccess = () => {
        toast({
            title: 'Success!',
            description: `Пост удален`,
        });
        void ctx.posts.getPostsByUserId.invalidate({ userId: props.userId });
    };

    if (isLoading) return <LoadingPage />;
    if (!data || !data.length) return <h1>No posts</h1>;

    return (
        <ScrollArea className={'h-screen w-full rounded-md border'}>
            <div className="p-4">
                {data.map((post) => (
                    <PostView
                        key={post.post.id}
                        {...post}
                        onSuccess={onSuccess}
                    />
                ))}
            </div>
        </ScrollArea>
    );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
    const { data } = api.profile.getUserByUsername.useQuery({
        username,
    });

    if (!data || !data.username) return <h1>404</h1>;

    return (
        <>
            <Head>
                <title>Profile page</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="shortcut icon" href="/favicon.ico" />
            </Head>
            <main className="h-full space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Страница пользователя</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 p-2">
                            <Image
                                src={data.profileImageUrl}
                                alt={`${data.username}'s profile image'`}
                                className="rounded-full"
                                width={64}
                                height={64}
                            />
                            <h1 className="flex flex-col items-start justify-between gap-2">
                                <span>@{data.username}</span>
                                <span>
                                    Зарегистрирован{' '}
                                    {dayjs(data.createdAt).fromNow()}
                                </span>
                            </h1>
                        </div>
                    </CardContent>
                </Card>
                <ProfileFeed userId={data.id} />
            </main>
        </>
    );
};

export const getStaticProps: GetStaticProps = async (context) => {
    const helpers = generateSSRHelper();

    const slug = context.params?.slug;

    if (typeof slug !== 'string') {
        throw new Error('slug must be a string');
    }

    const username = slug.replace('@', '');

    await helpers.profile.getUserByUsername.prefetch({ username });

    return {
        props: {
            trpcState: helpers.dehydrate(),
            username,
        },
    };
};

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: 'blocking',
    };
};

export default ProfilePage;
