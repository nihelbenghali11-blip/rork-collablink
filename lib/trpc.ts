import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

export const getBaseUrl = () => {
  return "https://towanda-proauthor-carlos.ngrok-free.dev";
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
        return userId ? { "x-user-id": userId } : {};
      },
      fetch(url, options) {
        const opts: RequestInit = {
          ...options,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(options?.headers || {}),
            "ngrok-skip-browser-warning": "true",
          },
          method: "POST",
          mode: Platform.OS === "web" ? "cors" : undefined,
          credentials: "omit",
          keepalive: false,
        } as RequestInit;
        console.log("[tRPC] Fetching:", String(url));
        return fetch(url as RequestInfo, opts).catch((error) => {
          console.error("[tRPC] Fetch error:", error);
          throw error;
        });
      },
    }),
  ],
});
