import { type RouterOutputs, api } from '~/utils/api';
import dayjs from 'dayjs';
import Image from 'next/image';
import { toast } from '~/components/use-toast';
import Link from 'next/link';
import { Separator } from '~/components/ui/separator';
import { X } from 'lucide-react';

type PostWithUser = RouterOutputs['posts']['getAll'][number] & {
    onSuccess: () => void;
};
export const PostView = (props: PostWithUser) => {
    const { author, post } = props;

    const { mutate } = api.posts.delete.useMutation({
        onSuccess: props.onSuccess,
        onError: (error) => {
            if (error.data?.code === 'TOO_MANY_REQUESTS') {
                toast({
                    title: 'Error!',
                    description: 'Слишком много запросов',
                });
                return;
            } else {
                toast({
                    title: 'Error!',
                    description: 'Не удалось удалить пост',
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
                <div className="flex w-full justify-start gap-4">
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
                        <span className="">{post.content}</span>
                    </div>
                </div>
                <X onClick={deletePost} className="h-6 w-6 cursor-pointer" />
            </div>
            <Separator />
        </div>
    );
};
