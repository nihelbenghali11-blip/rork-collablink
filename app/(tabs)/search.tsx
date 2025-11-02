import { Image } from "expo-image";
import React, { useState, useMemo } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CheckCircle2, Filter, MapPin, Search as SearchIcon, Users, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { trpc } from "@/lib/trpc";

type PriceIndex = "accessible" | "standard" | "premium" | null;
type SortOrder = "asc" | "desc" | null;

export default function SearchPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { userType } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  type PlatformType = "Instagram" | "TikTok" | "YouTube" | "Facebook" | "Snapchat" | null;
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(null);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState<PriceIndex>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortByFollowers, setSortByFollowers] = useState<SortOrder>(null);
  
  const isSearchingInfluencers = userType === "brand";
  const influencersQuery = trpc.users.searchInfluencers.useQuery(
    {
      q: (searchQuery?.trim()?.length ?? 0) > 0 ? searchQuery.trim() : undefined,
      platform: selectedPlatform ?? undefined,
      sortFollowers: sortByFollowers ?? undefined,
      limit: 100,
    },
    { enabled: isSearchingInfluencers, staleTime: 30000 }
  );

  const brandsQuery = trpc.users.searchBrands.useQuery(
    { q: (searchQuery?.trim()?.length ?? 0) > 0 ? searchQuery.trim() : undefined, limit: 100 },
    { enabled: !isSearchingInfluencers, staleTime: 30000 }
  );

  type InflItem = {
    id: string;
    name: string | null;
    bio: string | null;
    avatar_url: string | null;
    primary_platform: string | null;
    followers_count: number | null;
    rating_avg: number | null;
  };

  type BrandItem = {
    id: string;
    name: string | null;
    bio: string | null;
    sector: string | null;
    website: string | null;
    phone: string | null;
    address: string | null;
    avatar_url: string | null;
    rating_avg: number | null;
  };

  const data = isSearchingInfluencers
    ? ((influencersQuery.data?.items ?? []) as unknown as any[])
    : ((brandsQuery.data?.items ?? []) as unknown as any[]);

  const filteredData = useMemo(() => {
    if (isSearchingInfluencers) {
      let influencers = (data as InflItem[]);
      if (selectedPlatform) {
        influencers = influencers.filter((inf) => (inf.primary_platform ?? "") === selectedPlatform);
      }
      if (sortByFollowers) {
        influencers = [...influencers].sort((a, b) => {
          const af = a.followers_count ?? 0;
          const bf = b.followers_count ?? 0;
          return sortByFollowers === "asc" ? af - bf : bf - af;
        });
      }
      return influencers as unknown as any[];
    }
    return (data as BrandItem[]);
  }, [data, isSearchingInfluencers, selectedPlatform, sortByFollowers]);

  const getPriceIndexDisplay = (priceIndex: string) => {
    switch (priceIndex) {
      case "accessible":
        return t("search.accessible");
      case "standard":
        return t("search.standard");
      case "premium":
        return t("search.premium");
      default:
        return "";
    }
  };

  const getPriceIndexColor = (priceIndex: string) => {
    switch (priceIndex) {
      case "accessible":
        return "#10B981";
      case "standard":
        return "#6366F1";
      case "premium":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const platforms = ["Instagram", "TikTok", "YouTube", "Snapchat", "Facebook"] as const;
  const priceIndices: ("accessible" | "standard" | "premium")[] = ["accessible", "standard", "premium"];
  const categories = [
    "Fashion & Lifestyle",
    "Technology & Gadgets",
    "Fitness & Wellness",
    "Food & Culinary",
    "Beauty & Makeup",
    "Travel & Adventure",
  ];

  const clearFilters = () => {
    setSelectedPlatform(null);
    setSelectedPriceIndex(null);
    setSelectedCategories([]);
    setSortByFollowers(null);
  };

  const activeFiltersCount = [
    selectedPlatform,
    selectedPriceIndex,
    selectedCategories.length > 0 ? true : false,
    sortByFollowers,
  ].filter(Boolean).length;

  const renderInfluencerCard = (influencer: InflItem) => (
    <Pressable
      key={influencer.id}
      style={styles.card}
      onPress={() => router.push(`/influencer-profile?id=${influencer.id}`)}
    >
      <View style={styles.cardContent}>
        <Image
          source={{ uri: influencer.avatar_url ?? undefined }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{influencer.name ?? "Unnamed"}</Text>
            
          </View>
          <Text style={styles.cardUsername}>{influencer.bio ?? ""}</Text>
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Users size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                {Math.round((influencer.followers_count ?? 0) / 1000)}K
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.metaText}>{influencer.primary_platform ?? ""}</Text>
            </View>
          </View>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{influencer.primary_platform ?? ""}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{influencer.bio ? influencer.bio.slice(0, 24) : ""}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View
          style={[
            styles.priceIndexBadge,
            { backgroundColor: "#EEF2FF" },
          ]}
        >
          <Text
            style={[
              styles.priceIndexText,
              { color: "#6366F1" },
            ]}
          >
            {influencer.primary_platform ?? ""}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const renderBrandCard = (brand: BrandItem) => (
    <Pressable 
      key={brand.id} 
      style={styles.card}
      onPress={() => router.push(`/brand-profile?id=${brand.id}`)}
    >
      <View style={styles.cardContent}>
        <Image
          source={{ uri: brand.avatar_url ?? undefined }}
          style={styles.brandLogo}
          contentFit="cover"
        />
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{brand.name ?? "Unnamed"}</Text>
            
          </View>
          <Text style={styles.cardUsername}>{brand.sector ?? ""}</Text>
          <Text style={styles.brandDescription} numberOfLines={2}>
            {brand.bio ?? ""}
          </Text>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {brand.sector ?? "Brand"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder={t("search.searchPlaceholder")}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        {isSearchingInfluencers && (
          <Pressable
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={20} color="#6366F1" />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredData}
        renderItem={({ item }) =>
          isSearchingInfluencers
            ? renderInfluencerCard(item as InflItem)
            : renderBrandCard(item as BrandItem)
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t("search.filterBy")}</Text>
            <Pressable onPress={() => setShowFilters(false)}>
              <X size={24} color="#111827" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentInner}
          >
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{t("search.platform")}</Text>
              <View style={styles.filterOptions}>
                {platforms.map((platform) => (
                  <Pressable
                    key={platform}
                    style={[
                      styles.filterOption,
                      selectedPlatform === platform && styles.filterOptionActive,
                    ]}
                    onPress={() =>
                      setSelectedPlatform(
                        selectedPlatform === platform ? null : platform
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedPlatform === platform &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {platform}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{t("search.priceIndex")}</Text>
              <View style={styles.filterOptions}>
                {priceIndices.map((priceIndex) => {
                  const display = getPriceIndexDisplay(priceIndex);
                  return (
                    <Pressable
                      key={priceIndex}
                      style={[
                        styles.filterOption,
                        selectedPriceIndex === priceIndex &&
                          styles.filterOptionActive,
                      ]}
                      onPress={() =>
                        setSelectedPriceIndex(
                          selectedPriceIndex === priceIndex ? null : priceIndex
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedPriceIndex === priceIndex &&
                            styles.filterOptionTextActive,
                        ]}
                      >
                        {display}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{t("search.category")}</Text>
              <View style={styles.filterOptions}>
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <Pressable
                      key={category}
                      style={[
                        styles.filterOption,
                        isSelected && styles.filterOptionActive,
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedCategories(
                            selectedCategories.filter((c) => c !== category)
                          );
                        } else {
                          setSelectedCategories([...selectedCategories, category]);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          isSelected && styles.filterOptionTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>{t("search.sortBy")}</Text>
              <View style={styles.filterOptions}>
                <Pressable
                  style={[
                    styles.filterOption,
                    sortByFollowers === "asc" && styles.filterOptionActive,
                  ]}
                  onPress={() =>
                    setSortByFollowers(sortByFollowers === "asc" ? null : "asc")
                  }
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      sortByFollowers === "asc" && styles.filterOptionTextActive,
                    ]}
                  >
                    {t("search.followersAsc")}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.filterOption,
                    sortByFollowers === "desc" && styles.filterOptionActive,
                  ]}
                  onPress={() =>
                    setSortByFollowers(sortByFollowers === "desc" ? null : "desc")
                  }
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      sortByFollowers === "desc" && styles.filterOptionTextActive,
                    ]}
                  >
                    {t("search.followersDesc")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>{t("search.clearFilters")}</Text>
            </Pressable>
            <Pressable
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>{t("search.applyFilters")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
  },
  cardUsername: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  brandDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
  },
  priceIndexBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  priceIndexText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
  },
  modalContent: {
    flex: 1,
  },
  modalContentInner: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  filterSection: {
    marginBottom: 28,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "transparent",
  },
  filterOptionActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#6366F1",
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  filterOptionTextActive: {
    color: "#6366F1",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#6B7280",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#6366F1",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
