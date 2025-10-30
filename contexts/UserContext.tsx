import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { setTRPCUserId } from "@/lib/trpc";

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
  priceIndex?: "accessible" | "standard" | "premium";
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

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [storedType, storedProfile] = await Promise.all([
        AsyncStorage.getItem(USER_TYPE_KEY),
        AsyncStorage.getItem(USER_PROFILE_KEY),
      ]);

      if (storedType && storedProfile) {
        const type = storedType as UserType;
        let profile = JSON.parse(storedProfile);
        
        if (!profile.userId) {
          profile = {
            ...profile,
            userId: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          };
          await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
        }
        
        setUserTypeState(type);
        
        if (type === "brand") {
          setBrandProfileState(profile);
        } else if (type === "influencer") {
          setInfluencerProfileState(profile);
        }
        
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
      await AsyncStorage.setItem(USER_TYPE_KEY, "influencer");
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
      setInfluencerProfileState(profile);
      setUserTypeState("influencer");
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to save influencer profile:", error);
    }
  }, []);

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
