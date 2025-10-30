import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const userId = opts.req.headers.get("x-user-id") ?? undefined;
  return {
    req: opts.req,
    userId,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Missing x-user-id" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
