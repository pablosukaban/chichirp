import { type RouterOutputs, api } from '~/utils/api';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import Image from 'next/image';
import { toast } from '~/components/use-toast';
import Link from 'next/link';
import { Separator } from '~/components/ui/separator';
import { MoreHorizontal, Trash2, Link as LinkIcon } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ConfirmDelete } from './ui/confirmDelete';

dayjs.extend(relativeTime);
dayjs.locale('ru');

type PostWithUser = RouterOutputs['posts']['getAll'][number] & {
    onSuccess?: () => void;
    isSeparatorNeeded?: boolean;
};
export const PostView = (props: PostWithUser) => {
    const [confirmOpened, setConfirmOpened] = React.useState(false);
    const { author, post, isSeparatorNeeded = true } = props;
    const { user } = useUser();

    const { mutate, isLoading: postDeleting } = api.posts.delete.useMutation({
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
        // setConfirmOpened(true);
    };

    const share = () => {
        void navigator.clipboard.writeText(
            `${window.location.href}post/${post.id}`,
        );
        toast({
            description: 'Ссылка на пост успешно скопирована',
        });
    };

    return (
        <div key={post.id}>
            <div
                className={'flex w-full items-center justify-between gap-4 p-4'}
            >
                <div className="flex w-full justify-start gap-4">
                    <Link href={`/@${author.username}`}>
                        <Image
                            src={author.profileImageUrl}
                            className="h-16 w-16 rounded-full"
                            width={64}
                            height={64}
                            alt={`@${author.username}'s profile image`}
                        />
                    </Link>
                    <div className="flex w-full flex-col flex-wrap justify-between gap-2">
                        <div
                            className={
                                'flex w-full items-center justify-between gap-2'
                            }
                        >
                            <div className="flex flex-wrap">
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
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <MoreHorizontal />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={share}>
                                        <span className="flex items-center gap-2">
                                            <LinkIcon className="h-4 w-4" />
                                            Поделиться
                                        </span>
                                    </DropdownMenuItem>
                                    {user?.id === author.id && (
                                        <DropdownMenuItem
                                            onClick={() =>
                                                setConfirmOpened(true)
                                            }
                                        >
                                            <span className="flex items-center gap-2">
                                                <Trash2 className="h-4 w-4" />{' '}
                                                Удалить
                                            </span>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <Link href={`/post/${post.id}`}>
                            <span className="cursor-pointer break-all">
                                {post.content}
                            </span>
                        </Link>
                    </div>
                </div>
                <ConfirmDelete
                    text="Пост"
                    confirm={deletePost}
                    isOpen={confirmOpened}
                    trigger={<></>}
                    close={() => setConfirmOpened(false)}
                    isLoading={postDeleting}
                />
            </div>
            {isSeparatorNeeded && <Separator />}
        </div>
    );
};
