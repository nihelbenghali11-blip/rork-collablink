import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import { ArrowLeft, Send, Paperclip, X } from "lucide-react-native";
import React, { useState, useRef, useEffect } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMessaging, MessageAttachment } from "@/contexts/MessagingContext";
import { mockInfluencers, mockBrands } from "@/mocks/data";

export default function ConversationPage() {
  const { id, influencerId, userId, name } = useLocalSearchParams<{ 
    id?: string; 
    influencerId?: string;
    userId?: string;
    name?: string;
  }>();
  const router = useRouter();
  const { t } = useLanguage();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { getConversationMessages, addMessage, markAsRead } = useMessaging();

  const [inputText, setInputText] = useState<string>("");
  const [selectedAttachments, setSelectedAttachments] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const conversationId = id || `conv_${userId}_${Date.now()}`;
  const messages = getConversationMessages(conversationId as string);
  const influencer = influencerId ? mockInfluencers.find((inf) => inf.id === influencerId) : null;
  const brand = userId ? mockBrands.find((b) => b.userId === userId) : null;
  const displayName = name || influencer?.fullName || brand?.companyName || "Unknown";
  const displayAvatar = influencer?.avatar || brand?.logo || "https://via.placeholder.com/150";

  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId as string);
    }
  }, [conversationId]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments: MessageAttachment[] = result.assets.map((asset) => ({
          id: Date.now().toString() + Math.random().toString(),
          type: asset.mimeType?.startsWith("image/") ? "image" : "document",
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType,
          size: asset.size,
        }));

        setSelectedAttachments([...selectedAttachments, ...newAttachments]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setSelectedAttachments(selectedAttachments.filter((att) => att.id !== attachmentId));
  };

  const handleSend = async () => {
    if (inputText.trim().length === 0 && selectedAttachments.length === 0) return;

    setIsUploading(true);
    try {
      await addMessage(
        conversationId as string,
        inputText.trim(),
        "user",
        selectedAttachments.length > 0 ? selectedAttachments : undefined
      );

      setInputText("");
      setSelectedAttachments([]);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setIsUploading(false);
    }
  };

  const renderAttachment = (attachment: MessageAttachment, isInMessage: boolean = false) => {
    if (attachment.type === "image") {
      return (
        <Pressable
          key={attachment.id}
          onPress={() => {
            if (isInMessage && attachment.uri) {
              Linking.openURL(attachment.uri).catch(() => {
                Alert.alert("Error", "Failed to open image");
              });
            }
          }}
        >
          <Image
            source={{ uri: attachment.uri }}
            style={isInMessage ? styles.messageImage : styles.previewImage}
            contentFit="cover"
          />
        </Pressable>
      );
    }

    return (
      <Pressable
        key={attachment.id}
        style={styles.documentPreview}
        onPress={() => {
          if (isInMessage && attachment.uri) {
            Linking.openURL(attachment.uri).catch(() => {
              Alert.alert("Error", "Failed to open document");
            });
          }
        }}
      >
        <Text style={styles.documentIcon}>📄</Text>
        <Text style={styles.documentName} numberOfLines={1}>
          {attachment.name}
        </Text>
      </Pressable>
    );
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.sender === "user";
    
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.influencerMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.influencerBubble,
          ]}
        >
          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              {item.attachments.map((att: MessageAttachment) => 
                renderAttachment(att, true)
              )}
            </View>
          )}
          
          {item.text && (
            <Text style={[styles.messageText, isUser && styles.userMessageText]}>
              {item.text}
            </Text>
          )}
          
          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  if (!influencer && !brand && !name) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Conversation not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#111827" />
          </Pressable>
          <View style={styles.headerContent}>
            <Image
              source={{ uri: displayAvatar }}
              style={styles.headerAvatar}
              contentFit="cover"
            />
            <Text style={styles.headerName}>{displayName}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {selectedAttachments.length > 0 && (
          <View style={styles.attachmentPreviewContainer}>
            <FlatList
              horizontal
              data={selectedAttachments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.previewWrapper}>
                  {renderAttachment(item, false)}
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => removeAttachment(item.id)}
                  >
                    <X size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              )}
              contentContainerStyle={styles.attachmentPreviewList}
            />
          </View>
        )}

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          <Pressable
            onPress={handlePickDocument}
            style={styles.attachButton}
            disabled={isUploading}
          >
            <Paperclip size={20} color="#6366F1" />
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder={t("profile.writeMessage")}
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isUploading}
          />

          <Pressable
            onPress={handleSend}
            style={[
              styles.sendButton,
              (inputText.trim().length === 0 && selectedAttachments.length === 0) && styles.sendButtonDisabled,
            ]}
            disabled={inputText.trim().length === 0 && selectedAttachments.length === 0 || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send 
                size={20} 
                color={(inputText.trim().length > 0 || selectedAttachments.length > 0) ? "#FFFFFF" : "#9CA3AF"} 
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    justifyContent: "center",
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
  },
  headerName: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#111827",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: "75%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  influencerMessageContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: "#6366F1",
    borderBottomRightRadius: 4,
  },
  influencerBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  attachmentsContainer: {
    marginBottom: 8,
    gap: 8,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  documentPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  documentIcon: {
    fontSize: 24,
  },
  documentName: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#374151",
    marginBottom: 4,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  timestamp: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  userTimestamp: {
    color: "#E0E7FF",
  },
  attachmentPreviewContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 12,
  },
  attachmentPreviewList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  previewWrapper: {
    position: "relative",
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0,
    elevation: 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
  },
});
