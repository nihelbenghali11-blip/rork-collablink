import { useRouter } from "expo-router";
import {
  Activity,
  DollarSign,
  Megaphone,
  Plus,
} from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, Modal, Image } from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { useCampaigns } from "@/contexts/CampaignContext";
import { Campaign, mockInfluencers } from "@/mocks/data";

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

export default function DashboardPage() {
  const { t } = useLanguage();
  const { userType, brandProfile, influencerProfile } = useUser();
  const router = useRouter();
  const { getCampaignsByBrand, campaigns } = useCampaigns();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const brandCampaigns = brandProfile ? getCampaignsByBrand(brandProfile.id) : [];
  const influencerCampaigns = influencerProfile ? campaigns.filter(c => c.userId === influencerProfile.userId && c.status === "active") : [];
  const userCampaigns = userType === "brand" ? brandCampaigns.slice(0, 3) : influencerCampaigns.slice(0, 3);
  const activeCampaignsCount = brandCampaigns.filter(c => c.status === "active").length;

  const getEngagedInfluencers = (campaign: Campaign) => {
    if (!campaign.engagedInfluencers || campaign.engagedInfluencers.length === 0) {
      return [];
    }
    return mockInfluencers.filter(inf => campaign.engagedInfluencers?.includes(inf.id));
  };

  const getMainCurrency = () => {
    if (brandCampaigns.length === 0) return "EUR";
    return brandCampaigns[0].currency || "EUR";
  };

  const totalBudget = brandCampaigns
    .filter(c => c.status === "active" || c.status === "completed")
    .reduce((sum, c) => sum + c.budget, 0);

  const totalSpent = brandCampaigns
    .filter(c => c.status === "active")
    .reduce((sum, c) => {
      const campaignSpent = (c.collaborators || []).reduce((collabSum, collab) => collabSum + collab.amount, 0);
      return sum + campaignSpent;
    }, 0);

  const brandStats = {
    activeCampaigns: activeCampaignsCount,
    totalBudget: totalBudget,
    totalSpent: totalSpent,
  };

  const influencerProposedCount = influencerCampaigns.length;
  const influencerTotalEarnings = influencerCampaigns.reduce((sum, c) => sum + c.budget, 0);

  const influencerStats = {
    proposedCampaigns: influencerProposedCount,
    earnings: influencerTotalEarnings,
  };

  const renderBrandDashboard = () => (
    <>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>{t("dashboard.welcome")}</Text>
        <Text style={styles.userName}>{brandProfile?.companyName}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: "#EEF2FF" }]}>
          <View style={styles.statIcon}>
            <Activity size={20} color="#6366F1" />
          </View>
          <Text style={styles.statValue}>{brandStats.activeCampaigns}</Text>
          <Text style={styles.statLabel}>{t("dashboard.activeCampaigns")}</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#FEF3C7" }]}>
          <View style={styles.statIcon}>
            <Text style={styles.currencyIcon}>{getCurrencySymbol(getMainCurrency())}</Text>
          </View>
          <Text style={styles.statValue}>{brandStats.totalBudget.toLocaleString()}</Text>
          <Text style={styles.statLabel}>{t("dashboard.budget")}</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#D1FAE5" }]}>
          <View style={styles.statIcon}>
            <Text style={styles.currencyIcon}>{getCurrencySymbol(getMainCurrency())}</Text>
          </View>
          <Text style={styles.statValue}>{brandStats.totalSpent.toLocaleString()}</Text>
          <Text style={styles.statLabel}>{t("dashboard.totalSpent")}</Text>
        </View>
      </View>

      <View style={styles.actionSection}>
        <Pressable 
          style={styles.createButton}
          onPress={() => router.push("/create-campaign" as any)}
        >
          <Plus size={20} color="#FFF" />
          <Text style={styles.createButtonText}>{t("dashboard.createCampaign")}</Text>
        </Pressable>
      </View>
    </>
  );

  const renderInfluencerDashboard = () => (
    <>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>{t("dashboard.welcome")}</Text>
        <Text style={styles.userName}>{influencerProfile?.username}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: "#EEF2FF" }]}>
          <View style={styles.statIcon}>
            <Megaphone size={20} color="#6366F1" />
          </View>
          <Text style={styles.statValue}>{influencerStats.proposedCampaigns}</Text>
          <Text style={styles.statLabel}>{t("dashboard.proposedCampaigns")}</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#D1FAE5" }]}>
          <View style={styles.statIcon}>
            <DollarSign size={20} color="#10B981" />
          </View>
          <Text style={styles.statValue}>${influencerStats.earnings.toLocaleString()}</Text>
          <Text style={styles.statLabel}>{t("dashboard.earnings")}</Text>
        </View>
      </View>

      <View style={styles.actionSection}>
        <Pressable 
          style={styles.createButton}
          onPress={() => router.push("/create-influencer-campaign" as any)}
        >
          <Plus size={20} color="#FFF" />
          <Text style={styles.createButtonText}>{t("dashboard.addNewCampaign")}</Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {userType === "brand" ? renderBrandDashboard() : renderInfluencerDashboard()}

      <View style={styles.campaignsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t("dashboard.activeCampaigns")}
          </Text>
          <Pressable onPress={() => router.push("/all-campaigns" as any)}>
            <Text style={styles.viewAllText}>{t("dashboard.viewAll")}</Text>
          </Pressable>
        </View>

        {userCampaigns.length > 0 ? (
          <View style={styles.campaignsList}>
            {userCampaigns.map((campaign) => (
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
                  <View style={[
                    styles.statusBadge,
                    campaign.status === "active" && styles.statusActive,
                    campaign.status === "completed" && styles.statusCompleted,
                    campaign.status === "proposed" && styles.statusProposed,
                  ]}>
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
      </View>

      <Modal
        visible={selectedCampaign !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCampaign(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCampaign?.name}</Text>
              <Pressable onPress={() => setSelectedCampaign(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>{t("campaign.description")}</Text>
                <Text style={styles.detailValue}>{selectedCampaign?.description}</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>{t("campaign.budget")}</Text>
                  <Text style={styles.detailValue}>{getCurrencySymbol(selectedCampaign?.currency || "USD")} {selectedCampaign?.budget.toLocaleString()}</Text>
                </View>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>{t("campaign.targetPlatform")}</Text>
                  <Text style={styles.detailValue}>{selectedCampaign?.platform}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>{t("campaign.startDate")}</Text>
                  <Text style={styles.detailValue}>{selectedCampaign?.startDate}</Text>
                </View>
                {selectedCampaign?.endDate && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>{t("campaign.endDate")}</Text>
                    <Text style={styles.detailValue}>{selectedCampaign.endDate}</Text>
                  </View>
                )}
              </View>

              {selectedCampaign && (
                <View style={styles.influencersSection}>
                  <Text style={styles.sectionTitle2}>
                    {t("common.engagedInfluencers")} ({getEngagedInfluencers(selectedCampaign).length})
                  </Text>
                  {getEngagedInfluencers(selectedCampaign).length > 0 ? (
                    <View style={styles.influencersList}>
                      {getEngagedInfluencers(selectedCampaign).map((influencer) => (
                        <View key={influencer.id} style={styles.influencerCard}>
                          <Image source={{ uri: influencer.avatar }} style={styles.avatar} />
                          <View style={styles.influencerInfo}>
                            <Text style={styles.influencerName}>{influencer.fullName}</Text>
                            <Text style={styles.influencerUsername}>{influencer.username}</Text>
                            <Text style={styles.influencerStats}>
                              {(influencer.followers / 1000).toFixed(0)}K followers • {influencer.engagementRate}% engagement
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>{t("common.noInfluencers")}</Text>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingBottom: 40,
  },
  welcomeSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: "#111827",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  campaignsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6366F1",
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  statusActive: {
    backgroundColor: "#D1FAE5",
  },
  statusCompleted: {
    backgroundColor: "#DBEAFE",
  },
  statusProposed: {
    backgroundColor: "#FEF3C7",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
    flex: 1,
  },
  closeButton: {
    fontSize: 24,
    color: "#6B7280",
    paddingHorizontal: 8,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    gap: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "uppercase" as const,
  },
  detailValue: {
    fontSize: 16,
    color: "#111827",
  },
  influencersSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle2: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 12,
  },
  influencersList: {
    gap: 12,
  },
  influencerCard: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  influencerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  influencerName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 2,
  },
  influencerUsername: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  influencerStats: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 20,
  },
  currencyIcon: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
  },
});
