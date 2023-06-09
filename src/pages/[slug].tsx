import { type GetStaticProps, type NextPage } from 'next';
import Head from 'next/head';
import { api } from '~/utils/api';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { PostView } from '~/components/postview';
import { useToast } from '~/components/use-toast';
import { LoadingPage } from '~/components/ui/loading';
import { generateSSRHelper } from '~/server/helpers/ssgHelper';
import 'dayjs/locale/ru';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Button } from '~/components/ui/button';

dayjs.locale('ru');
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

const ProfileFeed = (props: { userId: string }) => {
    const {
        data: postsData,
        isLoading: isPostsLoading,
        fetchNextPage,
    } = api.posts.getInfiniteByUserId.useInfiniteQuery(
        {
            limit: 5,
            userId: props.userId,
        },
        {
            getNextPageParam: (lastPage) => {
                return lastPage.nextCursor;
            },
        },
    );

    const { toast } = useToast();

    const ctx = api.useContext();

    const onSuccess = () => {
        toast({
            title: 'Success!',
            description: `Пост удален`,
        });
        void ctx.posts.getPostsByUserId.invalidate({ userId: props.userId });
    };

    const loadMore = () => {
        void fetchNextPage();
    };

    if (isPostsLoading) return <LoadingPage />;
    // if (!data || !data.length) return <h1>No posts</h1>;

    if (!postsData) return <h1>No data</h1>;

    return (
        <div className={'w-full rounded-md border p-4'}>
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

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
    const { data } = api.profile.getUserByUsername.useQuery({
        username,
    });

    if (!data || !data.username) return <h1>404</h1>;

    // const d =

    return (
        <>
            <Head>
                <title>Profile page</title>
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
                                    {dayjs(data.createdAt).format('DD.MM.YYYY')}
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
