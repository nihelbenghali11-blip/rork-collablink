import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { setTRPCUserId, trpc } from "@/lib/trpc";
import { PricingTier, getBadgeFromTier } from "@/constants/pricing";

export type UserType = "brand" | "influencer" | null;

export interface BrandProfile {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  email: string;
  logo?: string;
  description?: string;
  rating?: number;
  website?: string;
  phone?: string;
  address?: string;
  photoUri?: string;
}

export interface InfluencerProfile {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  mainPlatform: string;
  followers: number;
  avatar?: string;
  avatarUrl?: string;
  bio?: string;
  engagementRate?: number;
  rating?: number;
  priceIndex?: "accessible" | "medium" | "premium";
  pricingTier?: PricingTier;
  pricingCurrency?: string;
  category?: "Fashion & Lifestyle" | "Technology & Gadgets" | "Fitness & Wellness" | "Food & Culinary" | "Beauty & Makeup" | "Travel & Adventure";
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  snapchatUrl?: string;
  primaryPlatform?: "Instagram" | "TikTok" | "YouTube" | "Facebook" | "Snapchat";
  followersCount?: number;
}

const USER_TYPE_KEY = "@collablink_user_type";
const USER_PROFILE_KEY = "@collablink_user_profile";

export const [UserProvider, useUser] = createContextHook(() => {
  const [userType, setUserTypeState] = useState<UserType>(null);
  const [brandProfile, setBrandProfileState] = useState<BrandProfile | null>(null);
  const [influencerProfile, setInfluencerProfileState] = useState<InfluencerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const normalizeInfluencerProfile = useCallback((profile: InfluencerProfile): InfluencerProfile => {
    const derivedBadge = profile.pricingTier ? getBadgeFromTier(profile.pricingTier) : null;
    return {
      ...profile,
      priceIndex: derivedBadge ?? profile.priceIndex,
    };
  }, []);

  const registerMutation = trpc.users.register.useMutation();
  const updateProfileMutation = trpc.users.updateProfile.useMutation();

  const loadUserData = useCallback(async () => {
    try {
      const [storedType, storedProfile] = await Promise.all([
        AsyncStorage.getItem(USER_TYPE_KEY),
        AsyncStorage.getItem(USER_PROFILE_KEY),
      ]);

      if (storedType && storedProfile) {
        const type = storedType as UserType;
        let profile = JSON.parse(storedProfile);
        
        if (!profile.userId || profile.userId.startsWith('user_')) {
          console.log("[UserContext] Migrating temp user to database");
          
          if (type !== null) {
            try {
              const result = await registerMutation.mutateAsync({
                role: type,
              name: type === "brand" ? profile.companyName : profile.fullName,
              email: profile.email,
              bio: profile.description || profile.bio,
              sector: type === "brand" ? profile.industry : undefined,
              primary_platform: type === "influencer" ? profile.primaryPlatform : undefined,
              followers_count: type === "influencer" ? profile.followersCount || profile.followers : undefined,
            });
            
            profile = {
              ...profile,
              userId: result.id,
            };
            
            await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
            console.log("[UserContext] User migrated successfully with ID:", result.id);
            } catch (error) {
              console.error("[UserContext] Failed to migrate user:", error);
              profile = {
                ...profile,
                userId: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              };
              await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
            }
          }
        }
        
        setUserTypeState(type);
        
        if (type === "brand") {
          setBrandProfileState(profile);
        } else if (type === "influencer") {
          setInfluencerProfileState(normalizeInfluencerProfile(profile));
        }
        
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [registerMutation, normalizeInfluencerProfile]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const setUserType = useCallback((type: UserType) => {
    setUserTypeState(type);
  }, []);

  const setBrandProfile = useCallback(async (profile: BrandProfile) => {
    try {
      await AsyncStorage.setItem(USER_TYPE_KEY, "brand");
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
      setBrandProfileState(profile);
      setUserTypeState("brand");
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to save brand profile:", error);
    }
  }, []);

  const setInfluencerProfile = useCallback(async (profile: InfluencerProfile) => {
    try {
      const normalized = normalizeInfluencerProfile(profile);
      await AsyncStorage.setItem(USER_TYPE_KEY, "influencer");
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(normalized));
      setInfluencerProfileState(normalized);
      setUserTypeState("influencer");
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to save influencer profile:", error);
    }
  }, [normalizeInfluencerProfile]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([USER_TYPE_KEY, USER_PROFILE_KEY]);
      setUserTypeState(null);
      setBrandProfileState(null);
      setInfluencerProfileState(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  }, []);

  const currentUserId = useMemo(() => {
    if (userType === "brand" && brandProfile) {
      return brandProfile.userId;
    } else if (userType === "influencer" && influencerProfile) {
      return influencerProfile.userId;
    }
    return null;
  }, [userType, brandProfile, influencerProfile]);

  useEffect(() => {
    setTRPCUserId(currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    const registerPushToken = async () => {
      if (Platform.OS === "web") {
        return;
      }
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const req = await Notifications.requestPermissionsAsync();
          finalStatus = req.status;
        }
        if (finalStatus !== "granted") {
          console.log("[Push] Permission not granted");
          return;
        }
        const tokenResponse = await Notifications.getExpoPushTokenAsync();
        const token = tokenResponse.data;
        if (token && currentUserId) {
          console.log("[Push] Got expo token", token);
          await updateProfileMutation.mutateAsync({ expo_push_token: token });
        }
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        }
      } catch (e) {
        console.log("[Push] Failed to register token", e);
      }
    };
    if (isAuthenticated) {
      registerPushToken();
    }
  }, [isAuthenticated, currentUserId, updateProfileMutation]);

  return useMemo(() => ({
    userType,
    setUserType,
    brandProfile,
    setBrandProfile,
    influencerProfile,
    setInfluencerProfile,
    isLoading,
    isAuthenticated,
    logout,
    currentUserId,
  }), [
    userType,
    setUserType,
    brandProfile,
    setBrandProfile,
    influencerProfile,
    setInfluencerProfile,
    isLoading,
    isAuthenticated,
    logout,
    currentUserId,
  ]);
});
