import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (Platform.OS === "web" && typeof window !== "undefined") {
    console.log("[tRPC] Running on web, using origin:", window.location.origin);
    return window.location.origin;
  }
  
  if (envUrl && envUrl.trim().length > 0) {
    console.log("[tRPC] Using EXPO_PUBLIC_RORK_API_BASE_URL:", envUrl);
    return envUrl;
  }

  throw new Error(
    "No API base URL. Set EXPO_PUBLIC_RORK_API_BASE_URL in your env or run via web."
  );
};

let currentUserId: string | null = null;

export const setTRPCUserId = (userId: string | null) => {
  currentUserId = userId;
};

const getUserIdFromStorage = async (): Promise<string | null> => {
  try {
    const profile = await AsyncStorage.getItem("@collablink_user_profile");
    if (profile) {
      const parsed = JSON.parse(profile);
      return parsed.userId || null;
    }
  } catch (error) {
    console.error("Failed to get userId from storage:", error);
  }
  return null;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async headers() {
        const userId = currentUserId || (await getUserIdFromStorage());
        console.log("[tRPC] Request headers, userId:", userId);
        return userId ? { "x-user-id": userId } : {};
      },
      fetch(url, options) {
        console.log("[tRPC] Fetching:", url);
        return fetch(url, options).catch((error) => {
          console.error("[tRPC] Fetch error:", error);
          throw error;
        });
      },
    }),
  ],
});
