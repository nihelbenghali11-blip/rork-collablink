import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import Avatar from "@/components/Avatar";
import { ArrowLeft, Send as SendIcon } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
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
    {
      enabled: !!conversationId,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchInterval: 3000,
      staleTime: 0,
    }
  );
  const markRead = trpc.messaging.markRead.useMutation();
  const sendMutation = trpc.messaging.sendMessage.useMutation();

  const otherId = userId as string | undefined;
  const displayName = name || userId || "Unknown";
  const otherProfile = trpc.users.getById.useQuery({ id: otherId || "" }, { enabled: !!otherId });
  const displayAvatar = otherProfile.data?.avatar_url
    ? (otherProfile.data.avatar_url as string)
    : (otherId
      ? `${getBaseUrl()}/api/users/${otherId}/avatar`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=E5E7EB&color=111827`);
  const myAvatar = currentUserId
    ? `${getBaseUrl()}/api/users/${currentUserId}/avatar`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent("Me")}&background=E5E7EB&color=111827`;

  useEffect(() => {
    if (conversationId) {
      markRead.mutate({ conversation_id: conversationId });
    }
  }, [conversationId, markRead]);

  useEffect(() => {
    if (conversationId) {
      markRead.mutate({ conversation_id: conversationId });
    }
  }, [messagesQuery.data?.length, conversationId, markRead]);

  const giftedMessages: IMessage[] = useMemo(() => {
    const arr = messagesQuery.data ?? [];
    console.log('[Conversation] mapping messages', { count: arr.length });
    return arr.map((m: any) => {
      const isMine = currentUserId === m.sender_id;
      const avatar = isMine ? myAvatar : displayAvatar;
      return {
        _id: m.id,
        text: m.content || "",
        createdAt: m.created_at ? new Date(m.created_at) : new Date(),
        user: {
          _id: isMine ? currentUserId || "me" : otherId || "other",
          name: isMine ? undefined : displayName,
          avatar,
        },
        image: m.attachment && m.attachment.mime_type?.startsWith?.("image/") ? m.attachment.storage_url : undefined,
        sent: true,
        received: !!m.read_at,
      } as IMessage;
    }).reverse();
  }, [messagesQuery.data, currentUserId, otherId, displayName, displayAvatar, myAvatar]);

  const onSend = useCallback(async (msgs: IMessage[]) => {
    const first = msgs[0];
    const text = first.text || "";
    if (!text.trim()) return;
    try {
      await sendMutation.mutateAsync({ conversation_id: conversationId, content: text.trim() });
      await messagesQuery.refetch();
    } catch (e) {
      console.log('[Conversation] send failed', e);
    }
  }, [conversationId, messagesQuery, sendMutation]);

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
            <Avatar userId={otherId} uri={otherProfile.data?.avatar_url as string | undefined} name={String(displayName)} size={36} rounded testID={`conversation-header-avatar-${otherId}`} />
            <Text style={styles.headerName}>{displayName}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {sendMutation.isError && (
          <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FEE2E2', borderBottomColor: '#FCA5A5', borderBottomWidth: 1 }}>
            <Text style={{ color: '#991B1B' }}>{t('common.error')}</Text>
          </View>
        )}

        <GiftedChat
          messages={giftedMessages}
          onSend={(msgs) => onSend(msgs as IMessage[])}
          user={{ _id: currentUserId || "me" }}
          isTyping={false}
          renderBubble={(props) => (
            <Bubble
              {...props}
              wrapperStyle={{
                left: { backgroundColor: "#FFFFFF", borderRadius: 18, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: "#E5E7EB" },
                right: { backgroundColor: "#4F46E5", borderRadius: 18, borderBottomRightRadius: 6 },
              }}
              textStyle={{ right: { color: "#FFFFFF" }, left: { color: "#374151" } }}
            />
          )}
          renderInputToolbar={(props) => (
            <InputToolbar
              {...props}
              containerStyle={styles.toolbarContainer}
              primaryStyle={styles.toolbarInner}
            />
          )}
          renderSend={(props) => (
            <Send
              {...props}
              containerStyle={styles.sendContainer}
              testID="send-button"
            >
              <View style={styles.sendButton}>
                <SendIcon color="#FFFFFF" size={18} />
              </View>
            </Send>
          )}
          timeTextStyle={{ left: { color: "#9CA3AF" }, right: { color: "#E0E7FF" } }}
          alwaysShowSend
          scrollToBottom
          showUserAvatar
          placeholder={t("messaging.typeMessage")}
          textInputProps={{
            style: styles.textInput,
            placeholderTextColor: "#9CA3AF",
            testID: "message-input",
            returnKeyType: "send",
            editable: !sendMutation.isPending,
          } as any}
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
  toolbarContainer: {
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  toolbarInner: {
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.select({ ios: 12, android: 8, default: 10 }) as number,
    color: "#111827",
    fontSize: 16,
  },
  sendContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
