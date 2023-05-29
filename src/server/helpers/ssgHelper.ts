import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '~/server/api/root';
import { prisma } from '~/server/db';
import SuperJSON from 'superjson';

export const generateSSRHelper = () =>
    createServerSideHelpers({
        router: appRouter,
        ctx: {
            prisma,
            userId: null,
        },

        transformer: SuperJSON,
    });
