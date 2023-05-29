import { type GetStaticProps, type NextPage } from 'next';
import Head from 'next/head';
import { PostView } from '~/components/postview';
import { generateSSRHelper } from '~/server/helpers/ssgHelper';
import { api } from '~/utils/api';
import { useRouter } from 'next/router';

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
    const { data } = api.posts.getById.useQuery({ id });
    const router = useRouter();

    const ctx = api.useContext();

    const onSuccess = () => {
        void ctx.posts.getAll.invalidate();
        void router.push('/');
    };

    if (!data) return null;

    return (
        <>
            <Head>
                <title>Single post page</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="shortcut icon" href="/favicon.ico" />
            </Head>
            <main className="h-full justify-self-start rounded-md border p-4">
                <h1 className="ml-2 text-lg font-medium">Пост</h1>
                <PostView {...data} onSuccess={onSuccess} />
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
