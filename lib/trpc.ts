import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

export const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const origin = window.location.origin.replace(/\/$/, "");
    const host = window.location.host;
    // Prefer same-origin when running in Rork/Expo web to avoid CORS and mixed environments
    if (host.includes("rork.app") || host.includes("exp.direct")) {
      console.log("[tRPC] Using same-origin base URL:", origin);
      return origin;
    }
  }

  if (envUrl && envUrl.trim().length > 0) {
    console.log("[tRPC] Using EXPO_PUBLIC_RORK_API_BASE_URL:", envUrl);
    return envUrl.replace(/\/$/, "");
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    console.log("[tRPC] Fallback to origin base URL:", window.location.origin);
    return window.location.origin.replace(/\/$/, "");
  }

  throw new Error(
    "No API base URL. Set EXPO_PUBLIC_RORK_API_BASE_URL or run in web with a same-origin backend."
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
        const opts: RequestInit = {
          ...options,
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
