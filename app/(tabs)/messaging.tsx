import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import { MessageCircle } from "lucide-react-native";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useUser } from "@/contexts/UserContext";

export default function MessagingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { currentUserId } = useUser();

  const convQuery = trpc.messaging.listConversations.useQuery(undefined, {
    enabled: !!currentUserId,
  });

  const conversations = convQuery.data ?? [];

  const renderConversation = ({ item }: { item: any }) => {
    const otherUserId = currentUserId ? (item.user_a_id === currentUserId ? item.user_b_id : item.user_a_id) : "";

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUserId)}&background=E5E7EB&color=111827`;

    return (
      <Pressable
        style={[styles.conversationCard, ((item.user_a_id === currentUserId ? item.unread_a : item.unread_b) ?? 0) > 0 && styles.unreadCard]}
        onPress={() => {
          router.push(`/conversation?id=${item.id}&userId=${otherUserId}&name=${otherUserId}` as any);
        }}
        testID={`conversation-${item.id}`}
      >
        <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.influencerName} numberOfLines={1}>{otherUserId}</Text>
            <Text style={styles.timestamp}>
              {item.updated_at ? new Date(item.updated_at).toLocaleString() : ""}
            </Text>
          </View>
          <View style={styles.messagePreview}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              Conversation
            </Text>
            {(((item.user_a_id === currentUserId ? item.unread_a : item.unread_b) ?? 0) > 0) && <View style={styles.unreadBadge} />}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t("messaging.title"),
          headerShown: true,
        }}
      />
      <View style={styles.container}>
        {(conversations.length === 0) ? (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>{t("messaging.noConversations")}</Text>
            <Text style={styles.emptyStateText}>{t("messaging.startConversation")}</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContent: {
    padding: 16,
  },
  conversationCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: "#F0F4FF",
    borderLeftWidth: 4,
    borderLeftColor: "#6366F1",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  influencerName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#111827",
  },
  timestamp: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  messagePreview: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  unreadMessage: {
    fontWeight: "600" as const,
    color: "#374151",
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366F1",
    marginTop: 6,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
