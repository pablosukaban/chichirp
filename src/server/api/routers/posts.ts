import { clerkClient } from '@clerk/nextjs';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { Ratelimit } from '@upstash/ratelimit'; // for deno: see above
import { Redis } from '@upstash/redis';
import { filterUserForClient } from '~/server/helpers/filterUserForClient';

// Create a new ratelimiter, that allows 5 requests per 1 minute
const ratelimit = new Ratelimit({
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

export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
        });

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
                    message: 'Author not found',
                });

            return {
                post,
                author: {
                    ...author,
                    username: author.username,
                },
            };
        });
    }),

    create: protectedProcedure
        .input(
            z.object({
                content: z.string().emoji().min(1).max(255),
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
                    message: `Post with id ${input.postId} not found`,
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
});
