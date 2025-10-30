import { Stack, useRouter } from "expo-router";
import { Check, X } from "lucide-react-native";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { useCampaigns } from "@/contexts/CampaignContext";
import { useUser } from "@/contexts/UserContext";

const CURRENCIES = ["EUR", "USD", "GBP", "TND", "MAD", "AED"];

const platformOptions = [
  { id: "instagram", name: "Instagram" },
  { id: "tiktok", name: "TikTok" },
  { id: "facebook", name: "Facebook" },
  { id: "snapchat", name: "Snapchat" },
  { id: "youtube", name: "YouTube" },
];

export default function CreateInfluencerCampaignPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { addCampaign } = useCampaigns();
  const { influencerProfile } = useUser();

  const [formData, setFormData] = useState({
    campaignName: "",
    brandName: "",
    revenue: "",
    currency: "EUR",
    description: "",
    platforms: [] as string[],
  });

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);

  const handleSubmit = async () => {
    if (
      !formData.campaignName ||
      !formData.brandName ||
      !formData.revenue ||
      !formData.description ||
      formData.platforms.length === 0
    ) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!influencerProfile) {
      Alert.alert("Erreur", "Profil influenceur introuvable");
      return;
    }

    try {
      await addCampaign({
        name: formData.campaignName,
        brandId: influencerProfile.id,
        brandName: formData.brandName,
        userId: influencerProfile.userId,
        status: "active",
        budget: parseFloat(formData.revenue),
        currency: formData.currency,
        startDate: new Date().toISOString().split("T")[0],
        description: formData.description,
        platform: formData.platforms
          .map((pId) => platformOptions.find((p) => p.id === pId)?.name || pId)
          .join(", "),
        platforms: formData.platforms,
      });

      Alert.alert(t("common.success"), "Campagne ajoutée avec succès!");
      router.back();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de créer la campagne");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Ajouter une Campagne",
          headerShown: true,
          headerBackVisible: true,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Nom de la campagne *</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le nom de la campagne"
            placeholderTextColor="#9CA3AF"
            value={formData.campaignName}
            onChangeText={(text) =>
              setFormData({ ...formData, campaignName: text })
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nom de la marque *</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le nom de la marque"
            placeholderTextColor="#9CA3AF"
            value={formData.brandName}
            onChangeText={(text) =>
              setFormData({ ...formData, brandName: text })
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Revenu *</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="1000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={formData.revenue}
              onChangeText={(text) =>
                setFormData({ ...formData, revenue: text })
              }
            />
            <Pressable
              style={styles.currencyPicker}
              onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
            >
              <Text style={styles.currencyText}>{formData.currency}</Text>
            </Pressable>
          </View>
          {showCurrencyPicker && (
            <View style={styles.pickerContainer}>
              {CURRENCIES.map((currency) => (
                <Pressable
                  key={currency}
                  style={styles.pickerOption}
                  onPress={() => {
                    setFormData({ ...formData, currency });
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text style={styles.pickerText}>{currency}</Text>
                  {formData.currency === currency && (
                    <Check size={20} color="#6366F1" />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Décrivez la campagne"
            placeholderTextColor="#9CA3AF"
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Plateformes de publication *</Text>
          <Pressable
            style={styles.input}
            onPress={() => setShowPlatformPicker(!showPlatformPicker)}
          >
            <Text
              style={
                formData.platforms.length > 0
                  ? styles.inputText
                  : styles.placeholderText
              }
            >
              {formData.platforms.length > 0
                ? formData.platforms
                    .map(
                      (pId) =>
                        platformOptions.find((p) => p.id === pId)?.name || pId
                    )
                    .join(", ")
                : "Sélectionner les plateformes"}
            </Text>
          </Pressable>
          {showPlatformPicker && (
            <View style={styles.pickerContainer}>
              {platformOptions.map((platform) => (
                <Pressable
                  key={platform.id}
                  style={styles.pickerOption}
                  onPress={() => {
                    if (formData.platforms.includes(platform.id)) {
                      setFormData({
                        ...formData,
                        platforms: formData.platforms.filter(
                          (pId) => pId !== platform.id
                        ),
                      });
                    } else {
                      setFormData({
                        ...formData,
                        platforms: [...formData.platforms, platform.id],
                      });
                    }
                  }}
                >
                  <Text style={styles.pickerText}>{platform.name}</Text>
                  {formData.platforms.includes(platform.id) && (
                    <Check size={20} color="#6366F1" />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Ajouter la campagne</Text>
        </Pressable>
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
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputText: {
    fontSize: 16,
    color: "#111827",
  },
  placeholderText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  amountRow: {
    flexDirection: "row",
    gap: 12,
  },
  amountInput: {
    flex: 1,
  },
  currencyPicker: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minWidth: 80,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
  },
  pickerContainer: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  pickerText: {
    fontSize: 16,
    color: "#111827",
  },
  submitButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center" as const,
    marginTop: 20,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
