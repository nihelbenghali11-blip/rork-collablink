import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CheckCircle2, Globe, Mail, MapPin, MessageCircle, Phone, Star } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { mockBrands } from "@/mocks/data";
import { useUser } from "@/contexts/UserContext";

export default function BrandProfilePage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { currentUserId } = useUser();

  const brand = mockBrands.find((b) => b.id === id);

  if (!brand) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Marque non trouvée</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleContact = () => {
    console.log("Opening conversation with brand:", brand.userId);
    console.log("Current user ID:", currentUserId);
    router.push(`/conversation?userId=${brand.userId}&name=${brand.companyName}`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} size={16} color="#F59E0B" fill="#F59E0B" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" size={16} color="#F59E0B" fill="#F59E0B" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={16} color="#D1D5DB" fill="none" />
      );
    }

    return stars;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Profil de la marque</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: brand.logo }}
            style={styles.logo}
            contentFit="cover"
          />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.brandName}>{brand.companyName}</Text>
              {brand.verified && (
                <CheckCircle2 size={24} color="#6366F1" fill="#6366F1" />
              )}
            </View>
            <Text style={styles.industry}>{brand.industry}</Text>

            {brand.rating && (
              <View style={styles.ratingContainer}>
                <View style={styles.starsRow}>
                  {renderStars(brand.rating)}
                </View>
                <Text style={styles.ratingText}>{brand.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{brand.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>

          {brand.website && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Globe size={20} color="#6366F1" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Site web</Text>
                <Text style={styles.infoValue}>{brand.website}</Text>
              </View>
            </View>
          )}

          {brand.phone && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Phone size={20} color="#6366F1" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{brand.phone}</Text>
              </View>
            </View>
          )}

          {brand.address && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <MapPin size={20} color="#6366F1" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Adresse</Text>
                <Text style={styles.infoValue}>{brand.address}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Mail size={20} color="#6366F1" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Campagnes actives</Text>
              <Text style={styles.infoValue}>{brand.activeCampaigns} campagnes</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.contactButton} onPress={handleContact}>
            <MessageCircle size={22} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Contacter</Text>
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
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    marginBottom: 20,
  },
  profileInfo: {
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: "#111827",
  },
  industry: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
  },
  section: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4B5563",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    marginTop: 12,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#6366F1",
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
