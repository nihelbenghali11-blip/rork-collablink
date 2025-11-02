import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Globe, Mail, MapPin, MessageCircle, Phone, Star } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { useUser } from "@/contexts/UserContext";
import Avatar from "@/components/Avatar";

export default function BrandProfilePage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { currentUserId } = useUser();

  const profileQuery = trpc.users.getById.useQuery(
    { id: String(id) },
    { enabled: typeof id === 'string' && id.length > 0 }
  );
  const brand = profileQuery.data;
  const displayName = brand?.name ?? "Unnamed";

  if (profileQuery.isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Chargement…</Text>
        </View>
      </View>
    );
  }

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

  const openConv = trpc.messaging.openConversation.useMutation();

  const handleContact = async () => {
    try {
      const conv = await openConv.mutateAsync({ other_user_id: brand.id });
      router.push(`/conversation?id=${conv.id}&userId=${brand.id}&name=${encodeURIComponent(brand.name ?? "")}`);
    } catch (e) {
      console.error("Failed to open conversation", e);
    }
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
          <Avatar
            userId={brand.id}
            uri={brand.avatar_url}
            name={displayName}
            size={120}
            rounded={false}
            preferBlob
            testID={`brand-profile-avatar-${brand.id}`}
          />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.brandName} testID="brand-name">{displayName}</Text>
              
            </View>
            <Text style={styles.industry}>{brand.sector ?? ""}</Text>

            {typeof brand.rating_avg === "number" && (
              <View style={styles.ratingContainer}>
                <View style={styles.starsRow}>
                  {renderStars(brand.rating_avg ?? 0)}
                </View>
                <Text style={styles.ratingText}>{Number(brand.rating_avg ?? 0).toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{brand.bio ?? ""}</Text>
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
              <Text style={styles.infoLabel}>Secteur</Text>
              <Text style={styles.infoValue}>{brand.sector ?? ""}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.footer, { flexDirection: "row", gap: 12 }] }>
          <Pressable style={[styles.contactButton, { flex: 1 }]} onPress={handleContact}>
            <MessageCircle size={22} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Contacter</Text>
          </Pressable>
          <Pressable style={[styles.contactButton, { flex: 1, backgroundColor: "#10B981" }]} onPress={() => router.push(`/rate?rateeId=${encodeURIComponent(brand.id)}&name=${encodeURIComponent(brand.name ?? "")}`)}>
            <Text style={styles.contactButtonText}>Noter</Text>
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
