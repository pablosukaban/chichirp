import { ConfirmDelete } from '~/components/postview';

import { type RouterOutputs } from '~/utils/api';
import Image from 'next/image';
import Link from 'next/link';

import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { Separator } from '~/components/ui/separator';
import { MoreHorizontal, Trash2, Link as LinkIcon } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useState } from 'react';

dayjs.extend(relativeTime);
dayjs.locale('ru');

type CommentWithUser = RouterOutputs['comments']['getAll'][number];
export const CommentView = (props: CommentWithUser) => {
    const [confirmOpened, setConfirmOpened] = useState(false);
    const { author, comment } = props;
    const { user } = useUser();

    const deletePost = () => {
        console.log('yo');
    };

    return (
        <div key={comment.id}>
            <div
                className={'flex w-full items-center justify-between gap-4 p-4'}
            >
                <div className="flex w-full items-center justify-start gap-4">
                    <Image
                        src={author.profileImageUrl}
                        className="h-12 w-12 rounded-full"
                        width={48}
                        height={48}
                        alt={`@${author.username}'s profile image`}
                    />
                    <div className="flex h-full flex-col justify-between gap-2">
                        <div className={'flex flex-wrap'}>
                            <Link href={`/@${author.username}`}>
                                <span className="text-sm">{`@${author.username}`}</span>
                            </Link>
                            {/* <span className="px-2 text-slate-400">·</span> */}
                            {/* <span className="text-slate-400">{`${dayjs(
                                comment.createdAt,
                            ).fromNow()}`}</span> */}
                        </div>
                        <span className="text-base">{comment.comment}</span>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {/* <DropdownMenuItem onClick={share}>
                            <span className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" />
                                Поделиться
                            </span>
                        </DropdownMenuItem> */}
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
                    text="Комментарий"
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
