import { type GetStaticProps, type NextPage } from 'next';
import Head from 'next/head';
import { PostView } from '~/components/postview';
import { generateSSRHelper } from '~/server/helpers/ssgHelper';
import { api } from '~/utils/api';

import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import relativeTime from 'dayjs/plugin/relativeTime';

import { ScrollArea } from '~/components/ui/scroll-area';
import { type Comments } from '@prisma/client';
import CreateCommentWizard from '~/components/CreateCommentsWizzard';
import { LoadingPage } from '~/components/ui/loading';
import { CommentView } from '~/components/commentview';

dayjs.extend(relativeTime);
dayjs.locale('ru');

interface CommentsFeedProps {
    commentsData:
        | {
              comment: Comments;
              author: {
                  username: string;
                  id: string;
                  profileImageUrl: string;
                  createdAt: number;
              };
          }[]
        | undefined;
    commentsIsLoading: boolean;
}

const CommentsFeed = ({
    commentsData,
    commentsIsLoading,
}: CommentsFeedProps) => {
    if (commentsIsLoading) return <LoadingPage />;

    return (
        <ScrollArea className={'w-full rounded-md border'}>
            <div className="p-4">
                {!commentsData || commentsData.length === 0 ? (
                    <h1 className="ml-2 text-center text-base font-medium">
                        У этого поста пока нет комментариев. <br />
                        Будьте первым!
                    </h1>
                ) : (
                    <div>
                        {commentsData.map((item) => (
                            <CommentView {...item} key={item.comment.id} />
                        ))}
                    </div>
                )}
            </div>
        </ScrollArea>
    );
};

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
    const { data: postWithAutor } = api.posts.getById.useQuery({ id });
    const { data: commentsData, isLoading: commentsLoading } =
        api.comments.getAll.useQuery({ postId: id });
    const onSuccess = () => {
        // void ctx.posts.getAll.invalidate();
        // void router.push('/');
    };

    if (!postWithAutor) return null;

    return (
        <>
            <Head>
                <title>Single post page</title>
            </Head>
            <main className="h-full space-y-2 justify-self-start ">
                <div className="rounded-md border p-6">
                    <h1 className="ml-2 text-lg font-medium">Пост</h1>
                    <PostView
                        {...postWithAutor}
                        onSuccess={onSuccess}
                        isSeparatorNeeded={false}
                    />
                </div>
                <CreateCommentWizard postId={postWithAutor.post.id} />
                <CommentsFeed
                    commentsData={commentsData}
                    commentsIsLoading={commentsLoading}
                />
            </main>
        </>
    );
};

export const getStaticProps: GetStaticProps = async (context) => {
    const helpers = generateSSRHelper();

    const id = context.params?.id;

    if (typeof id !== 'string') throw new Error('id must be a string');

    await helpers.posts.getById.prefetch({ id });

    return {
        props: {
            trpcState: helpers.dehydrate(),
            id,
        },
    };
};

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: 'blocking',
    };
};

export default SinglePostPage;
