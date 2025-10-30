import { useRouter } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCampaigns } from "@/contexts/CampaignContext";
import { useUser } from "@/contexts/UserContext";
import { trpc } from "@/lib/trpc";

export default function CreateCampaignPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addCampaign } = useCampaigns();
  const { brandProfile } = useUser();

  const [campaignName, setCampaignName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>("");
  const [currency, setCurrency] = useState<string>("EUR");
  const [objectives, setObjectives] = useState<string>("");
  const [requirements, setRequirements] = useState<string>("");
  const [hashtags, setHashtags] = useState<string>("");
  const [showPlatformPicker, setShowPlatformPicker] = useState<boolean>(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState<boolean>(false);

  const platformOptions = [
    { id: "instagram", name: t("campaign.instagram") },
    { id: "tiktok", name: t("campaign.tiktok") },
    { id: "facebook", name: t("campaign.facebook") },
    { id: "snapchat", name: "Snapchat" },
  ];

  const currencyOptions = ["EUR", "USD", "GBP", "TND", "MAD", "AED"];

  const createMutation = trpc.campaigns.create.useMutation();

  const handleSubmit = async () => {
    if (!campaignName.trim()) {
      Alert.alert(t("common.error"), "Please enter a campaign name");
      return;
    }
    if (platforms.length === 0) {
      Alert.alert(t("common.error"), "Please select at least one platform");
      return;
    }
    if (!budget.trim()) {
      Alert.alert(t("common.error"), "Please enter a budget");
      return;
    }

    if (!brandProfile) {
      Alert.alert(t("common.error"), "Brand profile not found");
      return;
    }

    try {
      const platformNames = platforms.map((pId) => platformOptions.find((p) => p.id === pId)?.name || pId).join(", ");
      
      const platformsFormatted = platforms.map((pId) => {
        const found = platformOptions.find((p) => p.id === pId);
        return found?.name || pId;
      }) as ("Instagram" | "TikTok" | "Facebook" | "Snapchat")[];

      const result = await createMutation.mutateAsync({
        name: campaignName,
        brand_name: brandProfile.companyName,
        status: "active",
        revenue_amount: parseFloat(budget),
        revenue_currency: currency,
        start_date: new Date().toISOString().split('T')[0],
        description: description || "",
        platforms: platformsFormatted,
      });

      await addCampaign({
        name: campaignName,
        brandId: brandProfile.id,
        brandName: brandProfile.companyName,
        status: "active",
        budget: parseFloat(budget),
        currency: currency,
        startDate: new Date().toISOString().split('T')[0],
        description: description || "",
        platform: platformNames,
        platforms: platforms,
        objectives: objectives || "",
        requirements: requirements || "",
        hashtags: hashtags || "",
      });

      router.push(`/campaign-details?id=${result.id}`);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      Alert.alert(t("common.error"), "Failed to create campaign");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>{t("campaign.createTitle")}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>{t("campaign.campaignName")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("campaign.campaignNamePlaceholder")}
            placeholderTextColor="#9CA3AF"
            value={campaignName}
            onChangeText={setCampaignName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("campaign.description")}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t("campaign.descriptionPlaceholder")}
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("campaign.targetPlatform")}</Text>
          <Pressable
            style={styles.input}
            onPress={() => setShowPlatformPicker(!showPlatformPicker)}
          >
            <Text style={platforms.length > 0 ? styles.inputText : styles.placeholderText}>
              {platforms.length > 0
                ? platforms.map((pId) => platformOptions.find((p) => p.id === pId)?.name || pId).join(", ")
                : t("campaign.selectPlatform")}
            </Text>
          </Pressable>

          {showPlatformPicker && (
            <View style={styles.pickerContainer}>
              {platformOptions.map((p) => (
                <Pressable
                  key={p.id}
                  style={styles.pickerOption}
                  onPress={() => {
                    if (platforms.includes(p.id)) {
                      setPlatforms(platforms.filter((pId) => pId !== p.id));
                    } else {
                      setPlatforms([...platforms, p.id]);
                    }
                  }}
                >
                  <Text style={styles.pickerText}>{p.name}</Text>
                  {platforms.includes(p.id) && <Check size={20} color="#6366F1" />}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("campaign.budget")}</Text>
          <View style={styles.budgetRow}>
            <TextInput
              style={[styles.input, styles.budgetInput]}
              placeholder={t("campaign.budgetPlaceholder")}
              placeholderTextColor="#9CA3AF"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
            <Pressable
              style={styles.currencyButton}
              onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
            >
              <Text style={styles.currencyText}>{currency}</Text>
            </Pressable>
          </View>

          {showCurrencyPicker && (
            <View style={styles.pickerContainer}>
              {currencyOptions.map((curr) => (
                <Pressable
                  key={curr}
                  style={styles.pickerOption}
                  onPress={() => {
                    setCurrency(curr);
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text style={styles.pickerText}>{curr}</Text>
                  {currency === curr && <Check size={20} color="#6366F1" />}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("campaign.objectives")}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t("campaign.objectivesPlaceholder")}
            placeholderTextColor="#9CA3AF"
            value={objectives}
            onChangeText={setObjectives}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("campaign.requirements")}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t("campaign.requirementsPlaceholder")}
            placeholderTextColor="#9CA3AF"
            value={requirements}
            onChangeText={setRequirements}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("campaign.hashtags")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("campaign.hashtagsPlaceholder")}
            placeholderTextColor="#9CA3AF"
            value={hashtags}
            onChangeText={setHashtags}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.primaryButtonText}>
              {t("campaign.submitCampaign")}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>
              {t("common.cancel")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
  },
  inputText: {
    fontSize: 15,
    color: "#111827",
  },
  placeholderText: {
    fontSize: 15,
    color: "#9CA3AF",
  },
  budgetRow: {
    flexDirection: "row" as const,
    gap: 12,
  },
  budgetInput: {
    flex: 1,
  },
  currencyButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    minWidth: 80,
  },
  currencyText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  pickerText: {
    fontSize: 15,
    color: "#111827",
  },
  buttonContainer: {
    gap: 12,
    marginTop: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
});
