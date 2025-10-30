import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Briefcase, ChevronLeft, Megaphone } from "lucide-react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";

export default function OnboardingPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type: "brand" | "influencer" }>();
  const userType = params.type || "brand";
  const { t } = useLanguage();
  const { setBrandProfile, setInfluencerProfile } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    industry: "",
    username: "",
    mainPlatform: "",
    followers: "",
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    
    await new Promise((resolve) => setTimeout(resolve, 800));

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const profileId = Date.now().toString();

    if (userType === "brand") {
      await setBrandProfile({
        id: profileId,
        userId,
        companyName: formData.companyName,
        industry: formData.industry,
        email: formData.email,
        description: `Welcome to ${formData.companyName}!`,
      });
    } else {
      await setInfluencerProfile({
        id: profileId,
        userId,
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        mainPlatform: formData.mainPlatform,
        followers: parseInt(formData.followers) || 0,
        bio: `Hi, I'm ${formData.fullName}!`,
        engagementRate: 4.5,
      });
    }

    setIsLoading(false);
    router.replace("/(tabs)/dashboard" as any);
  };

  const isBrandFormValid =
    formData.email &&
    formData.companyName &&
    formData.industry;

  const isInfluencerFormValid =
    formData.fullName &&
    formData.email &&
    formData.username &&
    formData.mainPlatform &&
    formData.followers;

  const isFormValid = userType === "brand" ? isBrandFormValid : isInfluencerFormValid;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>{t("auth.welcome")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.typeIndicator}>
          <View style={styles.typeIcon}>
            {userType === "brand" ? (
              <Briefcase size={32} color="#6366F1" />
            ) : (
              <Megaphone size={32} color="#6366F1" />
            )}
          </View>
          <Text style={styles.typeTitle}>
            {userType === "brand" ? t("landing.brandCTA") : t("landing.influencerCTA")}
          </Text>
          <Text style={styles.typeSubtitle}>{t("auth.createAccount")}</Text>
        </View>

        <View style={styles.form}>
          {userType === "brand" ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("auth.companyName")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Acme Corp"
                  value={formData.companyName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, companyName: text })
                  }
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("auth.industry")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Fashion, Technology, etc."
                  value={formData.industry}
                  onChangeText={(text) =>
                    setFormData({ ...formData, industry: text })
                  }
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("auth.email")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="hello@company.com"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("auth.fullName")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, fullName: text })
                  }
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("auth.username")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="@johndoe"
                  value={formData.username}
                  onChangeText={(text) =>
                    setFormData({ ...formData, username: text })
                  }
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("auth.email")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("auth.mainPlatform")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Instagram, TikTok, YouTube..."
                  value={formData.mainPlatform}
                  onChangeText={(text) =>
                    setFormData({ ...formData, mainPlatform: text })
                  }
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("auth.followers")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="50000"
                  value={formData.followers}
                  onChangeText={(text) =>
                    setFormData({ ...formData, followers: text })
                  }
                  keyboardType="number-pad"
                />
              </View>
            </>
          )}

          <Pressable
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>{t("auth.continue")}</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  typeIndicator: {
    alignItems: "center",
    paddingVertical: 32,
  },
  typeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  typeTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 8,
  },
  typeSubtitle: {
    fontSize: 15,
    color: "#6B7280",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#374151",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  submitButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
