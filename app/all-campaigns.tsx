import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { useCampaigns } from "@/contexts/CampaignContext";


const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    TND: "د.ت",
    MAD: "د.م",
    AED: "د.إ",
  };
  return symbols[currency] || currency;
};

export default function AllCampaignsPage() {
  const { t } = useLanguage();
  const { brandProfile, influencerProfile, userType } = useUser();
  const { getCampaignsByBrand, getCampaignsByUserId } = useCampaigns();
  const router = useRouter();

  const brandCampaigns = brandProfile ? getCampaignsByBrand(brandProfile.id) : [];
  const influencerCampaigns = influencerProfile ? getCampaignsByUserId(influencerProfile.userId) : [];
  const activeCampaigns = userType === "brand" 
    ? brandCampaigns.filter(c => c.status === "active")
    : influencerCampaigns.filter(c => c.status === "active");

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: t("dashboard.activeCampaigns"),
          headerShown: true,
          headerBackVisible: true,
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {activeCampaigns.length > 0 ? (
          <View style={styles.campaignsList}>
            {activeCampaigns.map((campaign) => (
              <Pressable 
                key={campaign.id} 
                style={styles.campaignCard}
                onPress={() => router.push(`/campaign-details?id=${campaign.id}` as any)}
              >
                <View style={styles.campaignHeader}>
                  <View style={styles.campaignInfo}>
                    <Text style={styles.campaignName}>{campaign.name}</Text>
                    <Text style={styles.campaignBrand}>
                      {userType === "brand" 
                        ? `${(campaign.collaborators?.length || 0)} ${t("common.engagedInfluencers")}`
                        : campaign.brandName}
                    </Text>
                  </View>
                  <View style={styles.statusActive}>
                    <Text style={styles.statusText}>{campaign.status}</Text>
                  </View>
                </View>
                <View style={styles.campaignDetails}>
                  <View style={styles.campaignDetail}>
                    <Text style={styles.campaignDetailText}>{getCurrencySymbol(campaign.currency || "USD")}{campaign.budget.toLocaleString()}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{t("dashboard.noCampaigns")}</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  campaignsList: {
    gap: 12,
  },
  campaignCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  campaignHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 4,
  },
  campaignBrand: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusActive: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#D1FAE5",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#374151",
    textTransform: "capitalize" as const,
  },
  campaignDetails: {
    flexDirection: "row",
    gap: 16,
  },
  campaignDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  campaignDetailText: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 15,
    color: "#9CA3AF",
  },
});
