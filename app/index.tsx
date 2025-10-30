import { useRouter } from "expo-router";
import { Briefcase, Globe, Megaphone, TrendingUp, Users, Zap } from "lucide-react-native";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { Language } from "@/constants/translations";

export default function LandingPage() {
  const router = useRouter();
  const { t, language, setLanguage, isLoading: langLoading } = useLanguage();
  const { isAuthenticated, isLoading: userLoading } = useUser();

  useEffect(() => {
    if (!langLoading && !userLoading && isAuthenticated) {
      router.replace("/(tabs)/dashboard" as any);
    }
  }, [isAuthenticated, langLoading, userLoading, router]);

  if (langLoading || userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const handleUserTypeSelection = (type: "brand" | "influencer") => {
    router.push({ pathname: "/onboarding", params: { type } } as any);
  };

  return (
    <View style={styles.bgWrapper}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.languageSelector}>
          {(["en", "ar", "fr"] as Language[]).map((lang) => (
            <Pressable
              key={lang}
              style={[
                styles.languageButton,
                language === lang && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange(lang)}
            >
              <Text
                style={[
                  styles.languageText,
                  language === lang && styles.languageTextActive,
                ]}
              >
                {lang.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Zap size={32} color="#FFF" fill="#FFF" />
            </View>
          </View>
          <Text style={styles.title}>{t("landing.title")}</Text>
          <Text style={styles.subtitle}>{t("landing.subtitle")}</Text>

          <View style={styles.ctaContainer}>
            <Pressable
              style={[styles.ctaButton, styles.brandButton]}
              onPress={() => handleUserTypeSelection("brand")}
            >
              <Briefcase size={20} color="#FFF" />
              <Text style={styles.ctaButtonText}>{t("landing.brandCTA")}</Text>
            </Pressable>

            <Pressable
              style={[styles.ctaButton, styles.influencerButton]}
              onPress={() => handleUserTypeSelection("influencer")}
            >
              <Megaphone size={20} color="#6366F1" />
              <Text style={styles.ctaButtonTextAlt}>
                {t("landing.influencerCTA")}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.features}>
          <Text style={styles.sectionTitle}>{t("landing.howItWorks")}</Text>

          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#EEF2FF" }]}>
                <Users size={24} color="#6366F1" />
              </View>
              <Text style={styles.featureTitle}>{t("landing.step1")}</Text>
              <Text style={styles.featureDescription}>
                {t("landing.step1Desc")}
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#FEF3C7" }]}>
                <TrendingUp size={24} color="#F59E0B" />
              </View>
              <Text style={styles.featureTitle}>{t("landing.step2")}</Text>
              <Text style={styles.featureDescription}>
                {t("landing.step2Desc")}
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#D1FAE5" }]}>
                <Globe size={24} color="#10B981" />
              </View>
              <Text style={styles.featureTitle}>{t("landing.step3")}</Text>
              <Text style={styles.featureDescription}>
                {t("landing.step3Desc")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.benefits}>
          <View style={styles.benefitCard}>
            <Text style={styles.benefitTitle}>{t("landing.forBrands")}</Text>
            <Text style={styles.benefitDescription}>
              {t("landing.forBrandsDesc")}
            </Text>
          </View>

          <View style={[styles.benefitCard, styles.benefitCardAlt]}>
            <Text style={styles.benefitTitle}>{t("landing.forInfluencers")}</Text>
            <Text style={styles.benefitDescription}>
              {t("landing.forInfluencersDesc")}
            </Text>
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bgWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  languageSelector: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  languageButtonActive: {
    backgroundColor: "#6366F1",
  },
  languageText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  languageTextActive: {
    color: "#FFFFFF",
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  ctaContainer: {
    width: "100%",
    gap: 12,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  brandButton: {
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  influencerButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#6366F1",
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  ctaButtonTextAlt: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#6366F1",
  },
  features: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: "#F9FAFB",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#111827",
    textAlign: "center",
    marginBottom: 32,
  },
  featureGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  benefits: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    gap: 16,
  },
  benefitCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 24,
  },
  benefitCardAlt: {
    backgroundColor: "#FEF3C7",
  },
  benefitTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 8,
  },
  benefitDescription: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
});
