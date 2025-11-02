import { createTRPCRouter } from "./create-context";

import hiRoute from "./routes/example/hi/route";

import campaignsCreate from "./routes/campaigns/create";
import campaignsUpdate from "./routes/campaigns/update";
import campaignsDelete from "./routes/campaigns/delete";
import campaignsListActiveByOwner from "./routes/campaigns/listActiveByOwner";
import campaignsLegacyRouter from "./routes/campaigns/router";

import collaboratorsCreate from "./routes/collaborators/create";
import collaboratorsList from "./routes/collaborators/list";
import collaboratorsUpdate from "./routes/collaborators/update";
import collaboratorsDelete from "./routes/collaborators/delete";
import collaboratorsLegacyRouter from "./routes/collaborators/router";

import listConversations from "./routes/messaging/listConversations";
import openConversation from "./routes/messaging/openConversation";
import sendMessage from "./routes/messaging/sendMessage";
import listMessages from "./routes/messaging/listMessages";

import ratingCreate from "./routes/ratings/create";

import getInfluencerCounters from "./routes/counters/getInfluencerCounters";
import getBrandTotals from "./routes/counters/getBrandTotals";

import updateProfile from "./routes/users/updateProfile";
import registerUser from "./routes/users/register";
import getProfile from "./routes/users/getProfile";
import loginUser from "./routes/users/login";
import searchInfluencers from "./routes/users/searchInfluencers";
import searchBrands from "./routes/users/searchBrands";
import getById from "./routes/users/getById";
import setAvatarBlob from "./routes/users/setAvatarBlob";
import markRead from "./routes/messaging/markRead";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),

  campaigns: createTRPCRouter({
    create: campaignsCreate,
    update: campaignsUpdate,
    delete: campaignsDelete,
    listActiveByOwner: campaignsListActiveByOwner,
    legacy: campaignsLegacyRouter,
  }),

  collaborators: createTRPCRouter({
    create: collaboratorsCreate,
    list: collaboratorsList,
    update: collaboratorsUpdate,
    delete: collaboratorsDelete,
    legacy: collaboratorsLegacyRouter,
  }),

  messaging: createTRPCRouter({
    listConversations,
    openConversation,
    sendMessage,
    listMessages,
  markRead,
  }),

  ratings: createTRPCRouter({
    create: ratingCreate,
  }),

  counters: createTRPCRouter({
    getInfluencerCounters,
    getBrandTotals,
  }),

  users: createTRPCRouter({
    register: registerUser,
    login: loginUser,
    getProfile,
    updateProfile,
    setAvatarBlob,
    searchInfluencers,
    searchBrands,
    getById,
  }),
});

export type AppRouter = typeof appRouter;
