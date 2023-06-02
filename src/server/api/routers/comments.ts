import { clerkClient } from '@clerk/nextjs';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { filterUserForClient } from '~/server/helpers/filterUserForClient';
import { type Comments } from '@prisma/client';

const attachUserDataToComments = async (comments: Comments[]) => {
    const users = (
        await clerkClient.users.getUserList({
            userId: comments.map((comment) => comment.authorId),
            limit: 100,
        })
    ).map(filterUserForClient);

    const newComments = comments.map((comment) => {
        const author = users.find((user) => user.id === comment.authorId);
        if (!author || !author.username)
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Автор не найден',
            });
        return {
            comment,
            author: {
                ...author,
                username: author.username,
            },
        };
    });

    return newComments;

    // return posts.map((post) => {
    //     const author = users.find((user) => user.id === post.authorId);
    //     if (!author || !author.username)
    //         throw new TRPCError({
    //             code: 'INTERNAL_SERVER_ERROR',
    //             message: 'Автор не найден',
    //         });

    //     return {
    //         post,
    //         author: {
    //             ...author,
    //             username: author.username,
    //         },
    //     };
    // });
};

export const commentsRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(
            z.object({
                postId: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const comments = await ctx.prisma.comments.findMany({
                where: { postId: input.postId },
                orderBy: { createdAt: 'desc' },
            });

            if (!comments) {
                return [];
            }

            return await attachUserDataToComments(comments);
        }),
});
