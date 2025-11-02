import { useRouter } from "expo-router";
import {
  Activity,
  DollarSign,
  Megaphone,
  Plus,
} from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { useCampaigns } from "@/contexts/CampaignContext";
import { trpc } from "@/lib/trpc";

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

type DbCampaign = {
  id: string;
  name: string;
  brand_name: string;
  revenue_amount: number | null;
  revenue_currency: string | null;
  status: "active" | "closed";
};

type CardCampaign = {
  id: string;
  name: string;
  brandName?: string;
  budget: number;
  currency: string;
  status: string;
  collaborators?: { amount: number }[];
};

export default function DashboardPage() {
  const { t } = useLanguage();
  const { userType, brandProfile, influencerProfile } = useUser();
  const router = useRouter();
  const { campaigns } = useCampaigns();

  const campaignsQuery = trpc.campaigns.listActiveByOwner.useQuery(undefined, {
    enabled: userType === "brand",
  });
  const totalsQuery = trpc.counters.getBrandTotals.useQuery(undefined, {
    enabled: userType === "brand",
  });

  const brandCampaignsFromDB: DbCampaign[] = useMemo(() => (campaignsQuery.data as unknown as DbCampaign[]) ?? [], [campaignsQuery.data]);

  const userCampaigns: CardCampaign[] = useMemo(() => {
    if (userType === "brand") {
      return brandCampaignsFromDB.slice(0, 3).map((c): CardCampaign => ({
        id: c.id,
        name: c.name,
        brandName: c.brand_name,
        budget: (c.revenue_amount ?? 0) as number,
        currency: (c.revenue_currency ?? "EUR") as string,
        status: c.status,
        collaborators: Array.from({ length: ((c as any).collaborators?.length ?? 0) }, () => ({ amount: 0 })),
      }));
    }
    const influencerCampaigns = influencerProfile ? campaigns.filter(c => c.userId === influencerProfile.userId && c.status === "active") : [];
    return influencerCampaigns.slice(0, 3).map((c): CardCampaign => ({
      id: c.id,
      name: c.name,
      brandName: c.brandName,
      budget: c.budget,
      currency: c.currency || "EUR",
      status: c.status,
      collaborators: c.collaborators,
    }));
  }, [userType, brandCampaignsFromDB, influencerProfile, campaigns]);

  const activeCampaignsCount = userType === "brand" ? brandCampaignsFromDB.length : (campaigns.filter(c => c.status === "active")).length;

  const mainCurrency = useMemo(() => {
    if (userType === "brand" && brandCampaignsFromDB.length > 0) return brandCampaignsFromDB[0].revenue_currency || "EUR";
    return "EUR";
  }, [userType, brandCampaignsFromDB]);

  const totalBudget = useMemo(() => {
    if (userType === "brand") {
      return brandCampaignsFromDB.reduce((sum: number, c: DbCampaign) => sum + (c.revenue_amount ?? 0), 0);
    }
    return 0;
  }, [userType, brandCampaignsFromDB]);

  const totalSpent = useMemo(() => {
    if (userType === "brand") {
      return totalsQuery.data?.totalSpentActiveCampaigns ?? 0;
    }
    return 0;
  }, [userType, totalsQuery.data]);

  const brandStats = {
    activeCampaigns: activeCampaignsCount,
    totalBudget: totalBudget,
    totalSpent: totalSpent,
  };

  const influencerCampaignsAll = influencerProfile ? campaigns.filter(c => c.userId === influencerProfile.userId && c.status === "active") : [];
  const influencerProposedCount = influencerCampaignsAll.length;
  const influencerTotalEarnings = influencerCampaignsAll.reduce((sum, c) => sum + c.budget, 0);

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
            <Text style={styles.currencyIcon}>{getCurrencySymbol(mainCurrency)}</Text>
          </View>
          <Text style={styles.statValue}>{brandStats.totalBudget.toLocaleString()}</Text>
          <Text style={styles.statLabel}>{t("dashboard.budget")}</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#D1FAE5" }]}>
          <View style={styles.statIcon}>
            <Text style={styles.currencyIcon}>{getCurrencySymbol(mainCurrency)}</Text>
          </View>
          <Text style={styles.statValue}>{brandStats.totalSpent.toLocaleString()}</Text>
          <Text style={styles.statLabel}>{t("dashboard.totalSpent")}</Text>
        </View>
      </View>

      <View style={styles.actionSection}>
        <Pressable 
          style={styles.createButton}
          onPress={() => router.push("/create-campaign" as any)}
          testID="btn-create-campaign"
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
          <Pressable onPress={() => router.push("/all-campaigns" as any)} testID="btn-view-all">
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
                testID={`card-campaign-${campaign.id}`}
              >
                <View style={styles.campaignHeader}>
                  <View style={styles.campaignInfo}>
                    <Text style={styles.campaignName}>{campaign.name}</Text>
                    <Text style={styles.campaignBrand}>
                      {userType === "brand" 
                        ? `${(campaign.collaborators?.length || 0)} ${t("common.engagedInfluencers")}`
                        : (campaign as any).brandName}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, styles.statusActive]}>
                    <Text style={styles.statusText}>active</Text>
                  </View>
                </View>
                <View style={styles.campaignDetails}>
                  <View style={styles.campaignDetail}>
                    <Text style={styles.campaignDetailText}>{getCurrencySymbol((campaign as any).currency || "EUR")}{campaign.budget.toLocaleString()}</Text>
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
  currencyIcon: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
  },
});
