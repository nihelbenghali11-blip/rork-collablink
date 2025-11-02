import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import { ArrowLeft } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc, getBaseUrl } from "@/lib/trpc";
import { useUser } from "@/contexts/UserContext";
import { GiftedChat, Bubble, InputToolbar, IMessage, Send } from "react-native-gifted-chat";

export default function ConversationPage() {
  const { id, userId, name } = useLocalSearchParams<{ id?: string; userId?: string; name?: string }>();
  const router = useRouter();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { currentUserId } = useUser();

  const conversationId = id as string;

  const messagesQuery = trpc.messaging.listMessages.useQuery(
    { conversation_id: conversationId },
    { enabled: !!conversationId }
  );
  const markRead = trpc.messaging.markRead.useMutation();
  const sendMutation = trpc.messaging.sendMessage.useMutation();

  const otherId = userId as string | undefined;
  const displayName = name || userId || "Unknown";
  const displayAvatar = otherId ? `${getBaseUrl()}/api/users/${otherId}/avatar` : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=E5E7EB&color=111827`;

  useEffect(() => {
    if (conversationId) {
      markRead.mutate({ conversation_id: conversationId });
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      markRead.mutate({ conversation_id: conversationId });
    }
  }, [messagesQuery.data?.length]);

  const giftedMessages: IMessage[] = useMemo(() => {
    const arr = messagesQuery.data ?? [];
    return arr.map((m: any) => {
      const isMine = currentUserId === m.sender_id;
      return {
        _id: m.id,
        text: m.content || "",
        createdAt: m.created_at ? new Date(m.created_at) : new Date(),
        user: {
          _id: isMine ? currentUserId || "me" : otherId || "other",
          name: isMine ? undefined : displayName,
          avatar: isMine ? undefined : displayAvatar,
        },
        image: m.attachment && m.attachment.mime_type.startsWith("image/") ? m.attachment.storage_url : undefined,
        sent: true,
        received: !!m.read_at,
      } as IMessage;
    }).reverse();
  }, [messagesQuery.data, currentUserId, otherId, displayName, displayAvatar]);

  const onSend = useCallback(async (msgs: IMessage[]) => {
    const first = msgs[0];
    const text = first.text || "";
    if (!text.trim()) return;
    await sendMutation.mutateAsync({ conversation_id: conversationId, content: text.trim() });
    await messagesQuery.refetch();
  }, [conversationId]);

  if (!conversationId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Conversation not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </Pressable>
          <View style={styles.headerContent}>
            <Image source={{ uri: displayAvatar }} style={styles.headerAvatar} contentFit="cover" />
            <Text style={styles.headerName}>{displayName}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <GiftedChat
          messages={giftedMessages}
          onSend={(msgs) => onSend(msgs as IMessage[])}
          user={{ _id: currentUserId || "me" }}
          isTyping={false}
          renderBubble={(props) => (
            <Bubble
              {...props}
              wrapperStyle={{
                left: { backgroundColor: "#FFFFFF", borderRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: "#E5E7EB" },
                right: { backgroundColor: "#6366F1", borderRadius: 18, borderBottomRightRadius: 4 },
              }}
              textStyle={{ right: { color: "#FFFFFF" }, left: { color: "#374151" } }}
            />
          )}
          renderInputToolbar={(props) => (
            <InputToolbar
              {...props}
              containerStyle={{ borderTopColor: "#E5E7EB", borderTopWidth: 1, backgroundColor: "#FFFFFF" }}
              primaryStyle={{ alignItems: "center" }}
            />
          )}
          renderSend={(props) => (
            <Send {...props} containerStyle={{ justifyContent: "center", alignItems: "center", paddingRight: 12 }}>
              <Text style={{ color: "#6366F1", fontWeight: "700" }}>Send</Text>
            </Send>
          )}
          timeTextStyle={{ left: { color: "#9CA3AF" }, right: { color: "#E0E7FF" } }}
          alwaysShowSend
          scrollToBottom
          showUserAvatar
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: { padding: 8 },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, justifyContent: "center" },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F3F4F6" },
  headerName: { fontSize: 17, fontWeight: "700" as const, color: "#111827" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" },
  errorText: { fontSize: 16, color: "#6B7280" },
});
