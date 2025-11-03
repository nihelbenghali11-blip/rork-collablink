import { Stack, useRouter } from "expo-router";
import Avatar from "@/components/Avatar";
import { MessageCircle } from "lucide-react-native";
import React, { useEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { getBaseUrl, trpc } from "@/lib/trpc";
import { useUser } from "@/contexts/UserContext";

export default function MessagingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { currentUserId, isLoading: userLoading } = useUser();

  const convQuery = trpc.messaging.listConversations.useQuery(undefined, {
    enabled: !!currentUserId && !userLoading,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: currentUserId ? 4000 : false,
    retry: false,
  });

  const conversations = convQuery.data ?? [];

  const renderConversation = ({ item }: { item: any }) => {
    const isA = item.user_a_id === currentUserId;
    const otherUser = currentUserId ? (isA ? item.userB : item.userA) : null;

    const displayName = otherUser?.name ?? (otherUser?.id ?? "");
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=E5E7EB&color=111827`;

    const preferBlob = isA ? (item.userB_has_blob === true) : (item.userA_has_blob === true);

    const lastSeenISO: string | null = otherUser?.updated_at ?? null;
    const isOnline = (() => {
      if (!lastSeenISO) return false;
      const last = new Date(lastSeenISO).getTime();
      return Date.now() - last < 90 * 1000;
    })();

    return (
      <Pressable
        style={[styles.conversationCard, ((item.user_a_id === currentUserId ? item.unread_a : item.unread_b) ?? 0) > 0 && styles.unreadCard]}
        onPress={() => {
          const otherId = otherUser?.id ?? "";
          const name = displayName;
          router.push(`/conversation?id=${item.id}&userId=${otherId}&name=${encodeURIComponent(name)}` as any);
        }}
        testID={`conversation-${item.id}`}
      >
        <View>
          <Avatar
            userId={otherUser?.id}
            uri={otherUser?.avatar_url}
            name={displayName}
            size={56}
            rounded
            preferBlob={preferBlob}
            testID={`conversation-avatar-${item.id}`}
          />
          {isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.influencerName} numberOfLines={1}>{displayName}</Text>
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

  useEffect(() => {
    let timer: any;
    const ping = async () => {
      try {
        await fetch(`${getBaseUrl()}/api/presence/ping`, { method: 'POST', headers: { 'x-user-id': currentUserId || '' } });
      } catch {}
    };
    if (currentUserId) {
      ping();
      timer = setInterval(ping, 30000);
    }
    return () => timer && clearInterval(timer);
  }, [currentUserId]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t("messaging.title"),
          headerShown: true,
        }}
      />
      <View style={styles.container}>
        {userLoading || !currentUserId ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.emptyStateTitle}>{t("messaging.loading") || "Chargement..."}</Text>
          </View>
        ) : convQuery.isError ? (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color="#EF4444" />
            <Text style={styles.emptyStateTitle}>Erreur</Text>
            <Text style={styles.emptyStateText}>
              {convQuery.error?.message || "Impossible de charger les conversations"}
            </Text>
          </View>
        ) : (conversations.length === 0) ? (
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
            onRefresh={() => convQuery.refetch()}
            refreshing={convQuery.isRefetching}
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
  onlineDot: {
    position: "absolute",
    right: 12,
    bottom: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderColor: "#FFFFFF",
    borderWidth: 2,
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
