import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import {
  CheckCircle2,
  MapPin,
  Users,
  Star,
  ArrowLeft,
  MessageCircle,
  Paperclip,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import { 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { useLanguage } from "@/contexts/LanguageContext";
import { mockInfluencers } from "@/mocks/data";

export default function InfluencerProfilePage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<{name: string; uri: string}[]>([]);

  const influencer = mockInfluencers.find((inf) => inf.id === id);

  if (!influencer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Influencer not found</Text>
      </View>
    );
  }

  const getPlatformCategoryTitle = () => {
    switch (language) {
      case "ar":
        return "المنصة والفئة";
      case "fr":
        return "Plateforme et Catégorie";
      default:
        return "Platform & Category";
    }
  };

  const renderStars = (score: number) => {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} size={16} color="#F59E0B" fill="#F59E0B" />
      );
    }

    if (hasHalfStar && fullStars < 5) {
      stars.push(
        <Star key="half" size={16} color="#F59E0B" fill="#F59E0B" />
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={16} color="#D1D5DB" fill="transparent" />
      );
    }

    return stars;
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setAttachments([...attachments, { name: file.name, uri: file.uri }]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    if (!message.trim() && attachments.length === 0) {
      Alert.alert('Error', 'Please write a message or attach a file');
      return;
    }

    console.log('Sending message:', message);
    console.log('Attachments:', attachments);
    
    Alert.alert('Success', 'Message sent successfully!');
    setMessage("");
    setAttachments([]);
    setShowMessageModal(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#111827" />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: influencer.avatar }}
            style={styles.coverImage}
            contentFit="cover"
          />
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: influencer.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.fullName}>{influencer.fullName}</Text>
            {influencer.verified && (
              <CheckCircle2 size={24} color="#6366F1" fill="#6366F1" />
            )}
          </View>
          <Text style={styles.username}>{influencer.username}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.metaText}>{influencer.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={16} color="#6B7280" />
              <Text style={styles.metaText}>
                {(influencer.followers / 1000).toFixed(0)}K {t("search.followers")}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.starRow}>
                {renderStars(influencer.collaborationScore)}
              </View>
              <Text style={styles.statValue}>({influencer.collaborationScore.toFixed(1)})</Text>
              <Text style={styles.statLabel}>{t("profile.collaborationScore")}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.priceIndexEmoji}>
                {influencer.priceIndex === "accessible" && "💰"}
                {influencer.priceIndex === "standard" && "💼"}
                {influencer.priceIndex === "premium" && "🏆"}
              </Text>
              <Text style={styles.statValue}>
                {influencer.priceIndex === "accessible" && t("search.accessible").replace("💰 ", "")}
                {influencer.priceIndex === "standard" && t("search.standard").replace("💼 ", "")}
                {influencer.priceIndex === "premium" && t("search.premium").replace("🏆 ", "")}
              </Text>
              <Text style={styles.statLabel}>{t("search.priceIndex")}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("profile.about")}</Text>
            <Text style={styles.bioText}>{influencer.bio}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{getPlatformCategoryTitle()}</Text>
            <View style={styles.tags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{influencer.mainPlatform}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{influencer.category}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Pressable 
              style={styles.primaryButton}
              onPress={() => setShowMessageModal(true)}
            >
              <MessageCircle size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>{t("profile.message")}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showMessageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMessageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t("profile.sendMessage")}</Text>
            <Pressable onPress={() => setShowMessageModal(false)}>
              <X size={24} color="#111827" />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder={t("profile.writeMessage")}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.attachmentSection}>
              <View style={styles.attachmentHeader}>
                <Text style={styles.attachmentTitle}>{t("profile.attachments")}</Text>
                <Pressable style={styles.attachButton} onPress={handlePickDocument}>
                  <Paperclip size={20} color="#6366F1" />
                  <Text style={styles.attachButtonText}>Add File</Text>
                </Pressable>
              </View>

              {attachments.length > 0 && (
                <View style={styles.attachmentList}>
                  {attachments.map((attachment, index) => (
                    <View key={index} style={styles.attachmentItem}>
                      <View style={styles.attachmentInfo}>
                        <Paperclip size={16} color="#6B7280" />
                        <Text style={styles.attachmentName} numberOfLines={1}>
                          {attachment.name}
                        </Text>
                      </View>
                      <Pressable onPress={() => handleRemoveAttachment(index)}>
                        <X size={18} color="#EF4444" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => {
                setShowMessageModal(false);
                setMessage("");
                setAttachments([]);
              }}
            >
              <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
            </Pressable>
            <Pressable style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>{t("profile.send")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverContainer: {
    height: 200,
    backgroundColor: "#E5E7EB",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    opacity: 0.3,
  },
  avatarContainer: {
    position: "absolute",
    bottom: -50,
    left: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "#F3F4F6",
  },
  profileInfo: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  fullName: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: "#111827",
  },
  username: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priceIndexEmoji: {
    fontSize: 32,
  },
  starRow: {
    flexDirection: "row",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  messageInputContainer: {
    marginBottom: 24,
  },
  messageInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    minHeight: 150,
  },
  attachmentSection: {
    marginBottom: 20,
  },
  attachmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  attachmentTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#111827",
  },
  attachButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  attachButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  attachmentList: {
    gap: 8,
  },
  attachmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  attachmentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#6B7280",
  },
  sendButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#6366F1",
    alignItems: "center",
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
