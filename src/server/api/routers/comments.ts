import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';

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
            });

            if (!comments) {
                return [];
            }

            return comments;
        }),
});
