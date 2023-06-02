import { clerkClient } from '@clerk/nextjs';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { filterUserForClient } from '~/server/helpers/filterUserForClient';
import { type Comments } from '@prisma/client';
import { ratelimit } from './posts';

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
    create: protectedProcedure
        .input(
            z.object({
                comment: z
                    .string()
                    .min(1, { message: 'Комментарий не может быть пустым' })
                    .max(250, {
                        message:
                            'Комментарий не может быть больше 250 символов',
                    }),
                postId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const authorId = ctx.userId;
            const { success } = await ratelimit.limit(authorId);
            if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

            const comment = await ctx.prisma.comments.create({
                data: {
                    comment: input.comment,
                    postId: input.postId,
                    authorId: ctx.userId,
                },
            });

            return comment;
        }),
});
