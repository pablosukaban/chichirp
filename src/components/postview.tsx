import { type RouterOutputs, api } from '~/utils/api';
import dayjs from 'dayjs';
import Image from 'next/image';
import { toast } from '~/components/use-toast';
import Link from 'next/link';
import { Separator } from '~/components/ui/separator';
import { MoreHorizontal, Trash2, Link as LinkIcon } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from './ui/alert-dialog';
import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

dayjs.extend(relativeTime);

type ConfirmDeleteProps = {
    trigger: React.ReactNode;
    isOpen: boolean;
    confirm: () => void;
    close: () => void;
};
const ConfirmDelete = ({
    confirm,
    trigger,
    isOpen,
    close,
}: ConfirmDeleteProps) => {
    return (
        <AlertDialog open={isOpen}>
            <AlertDialogTrigger>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Вы уверены, что хотите удалить этот пост?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Это действие нельзя будет отменить.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={close}>
                        Отмена
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={confirm}>
                        Подтвердить
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

type PostWithUser = RouterOutputs['posts']['getAll'][number] & {
    onSuccess?: () => void;
};
export const PostView = (props: PostWithUser) => {
    const [confirmOpened, setConfirmOpened] = React.useState(false);
    const { author, post } = props;
    const { user } = useUser();

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
                                onClick={() => setConfirmOpened(true)}
                            >
                                <span className="flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" /> Удалить
                                </span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                <ConfirmDelete
                    confirm={deletePost}
                    isOpen={confirmOpened}
                    trigger={<></>}
                    close={() => setConfirmOpened(false)}
                />
            </div>
            <Separator />
        </div>
    );
};
