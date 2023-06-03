import { clerkClient } from '@clerk/nextjs';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { Ratelimit } from '@upstash/ratelimit'; // for deno: see above
import { Redis } from '@upstash/redis';
import { filterUserForClient } from '~/server/helpers/filterUserForClient';
import { type Post } from '@prisma/client';

// Create a new ratelimiter, that allows 5 requests per 1 minute
export const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    /**
     * Optional prefix for the keys used in redis. This is useful if you want to share a redis
     * instance with other applications and want to avoid key collisions. The default prefix is
     * "@upstash/ratelimit"
     */
    prefix: '@upstash/ratelimit',
});

const attachUserDataToPosts = async (posts: Post[]) => {
    const users = (
        await clerkClient.users.getUserList({
            userId: posts.map((post) => post.authorId),
            limit: 100,
        })
    ).map(filterUserForClient);

    return posts.map((post) => {
        const author = users.find((user) => user.id === post.authorId);
        if (!author || !author.username)
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Автор не найден',
            });

        return {
            post,
            author: {
                ...author,
                username: author.username,
            },
        };
    });
};

export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
        });

        return attachUserDataToPosts(posts);
    }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.findUnique({
                where: {
                    id: input.id,
                },
            });

            if (!post)
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Пост не найден',
                });

            const postsWithUsers = (await attachUserDataToPosts([post]))[0];

            return postsWithUsers;
        }),

    getPostsByUserId: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(({ ctx, input }) =>
            ctx.prisma.post
                .findMany({
                    where: {
                        authorId: input.userId,
                    },
                    take: 100,
                    orderBy: { createdAt: 'desc' },
                })
                .then(attachUserDataToPosts),
        ),

    create: protectedProcedure
        .input(
            z.object({
                content: z
                    .string()
                    .min(1, { message: 'Пост не может быть пустым' })
                    .max(250, {
                        message: 'Пост не может быть больше 250 символов',
                    }),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const authorId = ctx.userId;

            const { success } = await ratelimit.limit(authorId);
            if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

            const post = await ctx.prisma.post.create({
                data: {
                    authorId,
                    content: input.content,
                },
            });

            return post;
        }),

    delete: protectedProcedure
        .input(z.object({ postId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { success } = await ratelimit.limit(ctx.userId);
            if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

            const foundPost = await ctx.prisma.post.findUnique({
                where: {
                    id: input.postId,
                },
            });

            if (!foundPost) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Пост с таким id не найден',
                });
            }

            if (foundPost.authorId !== ctx.userId) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                });
            }

            const deletedPost = await ctx.prisma.post.delete({
                where: {
                    id: input.postId,
                },
            });

            return deletedPost;
        }),

    getInfinitePosts: publicProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).nullish(),
                cursor: z.string().nullish(),
                skip: z.number().optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const limit = input.limit ?? 5;
            const { cursor } = input;

            const posts = await ctx.prisma.post.findMany({
                take: limit + 1,
                skip: input.skip,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: {
                    createdAt: 'desc',
                },
            });

            let nextCursor: typeof cursor | undefined = undefined;

            if (posts.length > limit) {
                const nextPost = posts.pop();
                nextCursor = nextPost?.id;
            }

            const postsWithUsers = await attachUserDataToPosts(posts);

            return {
                nextCursor,
                posts: postsWithUsers,
            };
        }),
});
