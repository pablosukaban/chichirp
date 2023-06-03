import { api } from '~/utils/api';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { useState } from 'react';
import { useToast } from '~/components/use-toast';

const CreateCommentWizard = ({ postId }: { postId: string }) => {
    const [inputValue, setInputValue] = useState('');
    const { toast } = useToast();
    // const { user } = useUser();
    const ctx = api.useContext();

    const { mutate, isLoading: commentCreating } =
        api.comments.create.useMutation({
            onSuccess: () => {
                setInputValue('');
                toast({
                    title: 'Success!',
                    description: 'Комментарий успешно создан',
                });
                void ctx.comments.getAll.invalidate();
            },
            onError: (error) => {
                const errorMesage = error.data?.zodError?.fieldErrors.content;

                if (errorMesage && errorMesage[0]) {
                    toast({ title: 'Error!', description: errorMesage[0] });
                } else {
                    toast({
                        title: 'Error!',
                        description: 'Ошибка в создании комментария',
                    });
                }
            },
        });

    const createPost = () => {
        mutate({ comment: inputValue, postId });
    };

    const handleButtonClick = () => {
        createPost();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        createPost();
    };

    return (
        <div className="rounded-md border p-4">
            <h1 className="mb-2 text-center font-semibold">
                Напишите комментарий!
            </h1>
            <div className="flex gap-2">
                <Input
                    placeholder="Ваш комментарий"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button onClick={handleButtonClick} disabled={commentCreating}>
                    Отправить
                </Button>
            </div>
        </div>
    );
};

export default CreateCommentWizard;
