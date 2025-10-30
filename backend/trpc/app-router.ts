import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import updateProfile from "./routes/users/updateProfile";
import createCampaign from "./routes/campaigns/create";
import listActiveByOwner from "./routes/campaigns/listActiveByOwner";
import updateCampaign from "./routes/campaigns/update";
import deleteCampaign from "./routes/campaigns/delete";
import createCollaborator from "./routes/collaborators/create";
import listCollaborators from "./routes/collaborators/list";
import updateCollaborator from "./routes/collaborators/update";
import deleteCollaborator from "./routes/collaborators/delete";
import openConversation from "./routes/messaging/openConversation";
import listConversations from "./routes/messaging/listConversations";
import sendMessage from "./routes/messaging/sendMessage";
import createRating from "./routes/ratings/create";
import getInfluencerCounters from "./routes/counters/getInfluencerCounters";
import getBrandTotals from "./routes/counters/getBrandTotals";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  users: createTRPCRouter({
    updateProfile,
  }),
  campaigns: createTRPCRouter({
    create: createCampaign,
    listActiveByOwner,
    update: updateCampaign,
    delete: deleteCampaign,
  }),
  collaborators: createTRPCRouter({
    create: createCollaborator,
    list: listCollaborators,
    update: updateCollaborator,
    delete: deleteCollaborator,
  }),
  messaging: createTRPCRouter({
    openConversation,
    listConversations,
    sendMessage,
  }),
  ratings: createTRPCRouter({
    create: createRating,
  }),
  counters: createTRPCRouter({
    getInfluencer: getInfluencerCounters,
    getBrandTotals,
  }),
});

export type AppRouter = typeof appRouter;
