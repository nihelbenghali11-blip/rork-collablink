import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Star } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RatePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { rateeId, name } = useLocalSearchParams<{ rateeId?: string; name?: string }>();
  const [score, setScore] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const listMyCampaigns = trpc.campaigns.listActiveByOwner.useQuery();
  const createRating = trpc.ratings.create.useMutation();

  const campaigns = listMyCampaigns.data ?? [];
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const canSubmit = useMemo(() => !!selectedCampaignId && !!rateeId && score >= 1 && score <= 5, [selectedCampaignId, rateeId, score]);

  const onSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createRating.mutateAsync({ campaign_id: selectedCampaignId!, ratee_user_id: String(rateeId), score, comment: comment.trim() || undefined });
      Alert.alert(t("common.success"), t("profile.thanksForRating") || "Thanks for your rating", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert(t("common.error"), e?.message || "Failed to submit rating");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t("profile.rate") || "Rate", headerShown: true }} />
      <Text style={styles.title}>{t("profile.rateUser") || "Rate"} {name ? decodeURIComponent(String(name)) : ""}</Text>

      <Text style={styles.label}>{t("campaign.campaignName") || "Campaign"}</Text>
      <FlatList
        data={campaigns}
        keyExtractor={(item: any) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8, gap: 8 }}
        renderItem={({ item }: { item: any }) => (
          <Pressable
            style={[styles.pill, selectedCampaignId === item.id && styles.pillActive]}
            onPress={() => setSelectedCampaignId(item.id)}
            testID={`campaign-pill-${item.id}`}
          >
            <Text style={[styles.pillText, selectedCampaignId === item.id && styles.pillTextActive]} numberOfLines={1}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />

      <Text style={styles.label}>{t("profile.yourRating") || "Your rating"}</Text>
      <View style={styles.starsRow}>
        {[1,2,3,4,5].map((i) => (
          <Pressable key={i} onPress={() => setScore(i)} testID={`star-${i}`}>
            <Star size={32} color="#F59E0B" fill={i <= score ? "#F59E0B" : "transparent"} />
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>{t("profile.commentOptional") || "Comment (optional)"}</Text>
      <TextInput
        style={styles.input}
        value={comment}
        onChangeText={setComment}
        placeholder={t("profile.writeComment") || "Share your experience"}
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Pressable style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]} onPress={onSubmit} disabled={!canSubmit} testID="submit-rating">
        <Text style={styles.submitText}>{t("common.submit") || "Submit"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", padding: 16 },
  title: { fontSize: 20, fontWeight: "800" as const, color: "#111827", marginBottom: 16 },
  label: { fontSize: 14, color: "#6B7280", marginTop: 12, marginBottom: 6 },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  input: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, color: "#111827", minHeight: 100 },
  submitButton: { marginTop: 16, backgroundColor: "#6366F1", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  submitButtonDisabled: { backgroundColor: "#CBD5E1" },
  submitText: { color: "#FFFFFF", fontWeight: "700" as const },
  pill: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#F3F4F6", borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB", maxWidth: 220 },
  pillActive: { backgroundColor: "#EEF2FF", borderColor: "#6366F1" },
  pillText: { color: "#374151", fontWeight: "600" as const },
  pillTextActive: { color: "#6366F1" },
});