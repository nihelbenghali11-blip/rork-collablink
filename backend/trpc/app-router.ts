import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import campaignsRouter from "./routes/campaigns/router";
import collaboratorsRouter from "./routes/collaborators/router";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  campaigns: campaignsRouter,
  collaborators: collaboratorsRouter,
});

export type AppRouter = typeof appRouter;
