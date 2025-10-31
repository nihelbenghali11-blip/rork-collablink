import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mockCampaigns, Campaign } from "@/mocks/data";

const CAMPAIGNS_KEY = "@collablink_campaigns";

export const [CampaignProvider, useCampaigns] = createContextHook(() => {
  const [campaigns, setCampaignsState] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const storedCampaigns = await AsyncStorage.getItem(CAMPAIGNS_KEY);
      if (storedCampaigns) {
        setCampaignsState(JSON.parse(storedCampaigns));
      } else {
        setCampaignsState(mockCampaigns);
      }
    } catch (error) {
      console.error("Failed to load campaigns:", error);
      setCampaignsState(mockCampaigns);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCampaigns = async (newCampaigns: Campaign[]) => {
    try {
      await AsyncStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(newCampaigns));
    } catch (error) {
      console.error("Failed to save campaigns:", error);
    }
  };

  const addCampaign = useCallback(async (campaign: Omit<Campaign, "id"> & { id?: string }) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: campaign.id ?? Date.now().toString(),
    };
    const updatedCampaigns = [...campaigns, newCampaign];
    setCampaignsState(updatedCampaigns);
    await saveCampaigns(updatedCampaigns);
    return newCampaign;
  }, [campaigns]);

  const updateCampaign = useCallback(async (id: string, updates: Partial<Campaign>) => {
    const updatedCampaigns = campaigns.map((campaign) =>
      campaign.id === id ? { ...campaign, ...updates } : campaign
    );
    setCampaignsState(updatedCampaigns);
    await saveCampaigns(updatedCampaigns);
  }, [campaigns]);

  const deleteCampaign = useCallback(async (id: string) => {
    const updatedCampaigns = campaigns.filter((campaign) => campaign.id !== id);
    setCampaignsState(updatedCampaigns);
    await saveCampaigns(updatedCampaigns);
  }, [campaigns]);

  const getCampaignsByBrand = useCallback((brandId: string) => {
    return campaigns.filter((campaign) => campaign.brandId === brandId);
  }, [campaigns]);

  const getActiveCampaigns = useCallback(() => {
    return campaigns.filter((campaign) => campaign.status === "active");
  }, [campaigns]);

  const getActiveCampaignsCount = useCallback(() => {
    return campaigns.filter((campaign) => campaign.status === "active").length;
  }, [campaigns]);

  const getCampaignsByUserId = useCallback((userId: string) => {
    return campaigns.filter((campaign) => campaign.userId === userId);
  }, [campaigns]);

  return useMemo(() => ({
    campaigns,
    isLoading,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaignsByBrand,
    getActiveCampaigns,
    getActiveCampaignsCount,
    getCampaignsByUserId,
  }), [
    campaigns,
    isLoading,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaignsByBrand,
    getActiveCampaigns,
    getActiveCampaignsCount,
    getCampaignsByUserId,
  ]);
});
