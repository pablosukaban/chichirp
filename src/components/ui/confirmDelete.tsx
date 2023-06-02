import dayjs from 'dayjs';
import 'dayjs/locale/ru';
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
} from '~/components/ui/alert-dialog';
import React from 'react';

dayjs.extend(relativeTime);
dayjs.locale('ru');

type ConfirmDeleteProps = {
    text: string;
    trigger: React.ReactNode;
    isOpen: boolean;
    isLoading: boolean;
    confirm: () => void;
    close: () => void;
};
export const ConfirmDelete = ({
    text,
    confirm,
    trigger,
    isOpen,
    close,
    isLoading,
}: ConfirmDeleteProps) => {
    return (
        <AlertDialog open={isOpen}>
            <AlertDialogTrigger>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Вы уверены, что хотите удалить этот {text}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Это действие нельзя будет отменить.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={close}>
                        Отмена
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={confirm} disabled={isLoading}>
                        Подтвердить
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
