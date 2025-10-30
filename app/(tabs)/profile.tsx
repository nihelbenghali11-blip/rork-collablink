import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import {
  Briefcase,
  Camera,
  Globe,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  Star,
  Edit2,
  Share2,
  Copy,
  Instagram,
  Facebook,
} from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ToastAndroid, Share, Platform } from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { useCampaigns } from "@/contexts/CampaignContext";

export default function ProfilePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { userType, brandProfile, influencerProfile, logout, setBrandProfile, setInfluencerProfile } = useUser();
  const { campaigns } = useCampaigns();
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [editWebsite, setEditWebsite] = useState(brandProfile?.website || "");
  const [editPhone, setEditPhone] = useState(brandProfile?.phone || "");
  const [editAddress, setEditAddress] = useState(brandProfile?.address || "");
  const [editDescription, setEditDescription] = useState(brandProfile?.description || "");
  
  const [isEditingInfluencerAbout, setIsEditingInfluencerAbout] = useState(false);
  const [editFullName, setEditFullName] = useState(influencerProfile?.fullName || "");
  const [editBio, setEditBio] = useState(influencerProfile?.bio || "");
  const [editEmail, setEditEmail] = useState(influencerProfile?.email || "");
  const [editInstagram, setEditInstagram] = useState(influencerProfile?.instagramUrl || "");
  const [editTiktok, setEditTiktok] = useState(influencerProfile?.tiktokUrl || "");
  const [editFacebook, setEditFacebook] = useState(influencerProfile?.facebookUrl || "");
  const [editSnapchat, setEditSnapchat] = useState(influencerProfile?.snapchatUrl || "");
  const [editPrimaryPlatform, setEditPrimaryPlatform] = useState<"Instagram" | "TikTok" | "YouTube" | "Facebook" | "Snapchat">(influencerProfile?.primaryPlatform || "Instagram");
  const [editFollowersCount, setEditFollowersCount] = useState(influencerProfile?.followersCount?.toString() || "");

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const handlePickInfluencerImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to change your photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && influencerProfile) {
      await setInfluencerProfile({
        ...influencerProfile,
        avatarUrl: result.assets[0].uri,
      });
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSaveInfluencerAbout = async () => {
    if (!validateUrl(editInstagram) || !validateUrl(editTiktok) || !validateUrl(editFacebook) || !validateUrl(editSnapchat)) {
      Alert.alert('Erreur', 'Veuillez entrer des URLs valides pour les liens sociaux');
      return;
    }

    if (!editPrimaryPlatform) {
      Alert.alert('Erreur', 'La plateforme principale est obligatoire');
      return;
    }

    if (influencerProfile) {
      await setInfluencerProfile({
        ...influencerProfile,
        fullName: editFullName,
        bio: editBio,
        email: editEmail,
        instagramUrl: editInstagram,
        tiktokUrl: editTiktok,
        facebookUrl: editFacebook,
        snapchatUrl: editSnapchat,
        primaryPlatform: editPrimaryPlatform,
        followersCount: parseInt(editFollowersCount) || 0,
      });
      setIsEditingInfluencerAbout(false);
    }
  };

  const handleCancelInfluencerEdit = () => {
    setEditFullName(influencerProfile?.fullName || "");
    setEditBio(influencerProfile?.bio || "");
    setEditEmail(influencerProfile?.email || "");
    setEditInstagram(influencerProfile?.instagramUrl || "");
    setEditTiktok(influencerProfile?.tiktokUrl || "");
    setEditFacebook(influencerProfile?.facebookUrl || "");
    setEditSnapchat(influencerProfile?.snapchatUrl || "");
    setEditPrimaryPlatform(influencerProfile?.primaryPlatform || "Instagram");
    setEditFollowersCount(influencerProfile?.followersCount?.toString() || "");
    setIsEditingInfluencerAbout(false);
  };

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  const handleShareProfile = async () => {
    try {
      const profileUrl = `https://collablink.app/profile/${influencerProfile?.userId || brandProfile?.userId}`;
      const result = await Share.share({
        message: `Découvrez mon profil sur CollabLink: ${profileUrl}`,
        url: profileUrl,
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Profile shared successfully');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Erreur', 'Impossible de partager le profil');
    }
  };

  const handleCopyProfileLink = async () => {
    const profileUrl = `https://collablink.app/profile/${influencerProfile?.userId || brandProfile?.userId}`;
    await Clipboard.setStringAsync(profileUrl);
    showToast('Lien copié ✓');
  };

  const handleOpenSocialLink = async (url?: string) => {
    if (!url) return;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to change your photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && brandProfile) {
      await setBrandProfile({
        ...brandProfile,
        photoUri: result.assets[0].uri,
      });
    }
  };

  const handleSaveAbout = async () => {
    if (brandProfile) {
      await setBrandProfile({
        ...brandProfile,
        website: editWebsite,
        phone: editPhone,
        address: editAddress,
        description: editDescription,
      });
      setIsEditingAbout(false);
    }
  };

  const handleCancelEdit = () => {
    setEditWebsite(brandProfile?.website || "");
    setEditPhone(brandProfile?.phone || "");
    setEditAddress(brandProfile?.address || "");
    setEditDescription(brandProfile?.description || "");
    setIsEditingAbout(false);
  };



  const getTotalCollaborators = () => {
    if (!brandProfile) return 0;
    const brandCampaigns = campaigns.filter(c => c.brandId === brandProfile.id && c.status === "active");
    return brandCampaigns.reduce((total, campaign) => {
      return total + (campaign.collaborators?.length || 0);
    }, 0);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          color="#F59E0B"
          fill={i < fullStars ? "#F59E0B" : "transparent"}
        />
      );
    }
    return stars;
  };

  const renderBrandProfile = () => (
    <>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Pressable onPress={handlePickImage}>
            {brandProfile?.photoUri ? (
              <Image
                source={{ uri: brandProfile.photoUri }}
                style={styles.profileAvatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.brandAvatar}>
                <Briefcase size={40} color="#6366F1" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Camera size={16} color="#FFF" />
            </View>
          </Pressable>
        </View>
        <Text style={styles.profileName}>{brandProfile?.companyName}</Text>
        <Text style={styles.profileBio}>{brandProfile?.industry}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.ratingRow}>
            {renderStars(brandProfile?.rating || 4.5)}
          </View>
          <Text style={styles.statValue}>{(brandProfile?.rating || 4.5).toFixed(1)}</Text>
          <Text style={styles.statLabel}>{t("profile.rating")}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getTotalCollaborators()}</Text>
          <Text style={styles.statLabel}>{t("profile.totalCollaborators")}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("profile.about")}</Text>
          {!isEditingAbout && (
            <Pressable onPress={() => setIsEditingAbout(true)}>
              <Edit2 size={20} color="#6366F1" />
            </Pressable>
          )}
        </View>

        {isEditingAbout ? (
          <View style={styles.editContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("profile.website")}</Text>
              <TextInput
                style={styles.input}
                value={editWebsite}
                onChangeText={setEditWebsite}
                placeholder="https://example.com"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("profile.phone")}</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="+33 6 12 34 56 78"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("profile.address")}</Text>
              <TextInput
                style={styles.input}
                value={editAddress}
                onChangeText={setEditAddress}
                placeholder="123 Street, City, Country"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("profile.description")}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Tell us about your brand..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.editActions}>
              <Pressable style={styles.saveButton} onPress={handleSaveAbout}>
                <Text style={styles.saveButtonText}>{t("common.save")}</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.infoItem}>
              <Mail size={20} color="#6B7280" />
              <Text style={styles.infoText}>{brandProfile?.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <Briefcase size={20} color="#6B7280" />
              <Text style={styles.infoText}>{brandProfile?.industry}</Text>
            </View>
            {brandProfile?.website && (
              <View style={styles.infoItem}>
                <Globe size={20} color="#6B7280" />
                <Text style={styles.infoText}>{brandProfile.website}</Text>
              </View>
            )}
            {brandProfile?.phone && (
              <View style={styles.infoItem}>
                <Phone size={20} color="#6B7280" />
                <Text style={styles.infoText}>{brandProfile.phone}</Text>
              </View>
            )}
            {brandProfile?.address && (
              <View style={styles.infoItem}>
                <MapPin size={20} color="#6B7280" />
                <Text style={styles.infoText}>{brandProfile.address}</Text>
              </View>
            )}
            {brandProfile?.description && (
              <Text style={styles.bioText}>{brandProfile.description}</Text>
            )}
          </>
        )}
      </View>
    </>
  );

  const renderInfluencerProfile = () => (
    <>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Pressable onPress={handlePickInfluencerImage}>
            <Image
              source={{
                uri: influencerProfile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
              }}
              style={styles.profileAvatar}
              contentFit="cover"
            />
            <View style={styles.cameraIcon}>
              <Camera size={16} color="#FFF" />
            </View>
          </Pressable>
        </View>
        <Text style={styles.profileName}>{influencerProfile?.fullName}</Text>
        <Text style={styles.profileBio}>{influencerProfile?.username}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {((influencerProfile?.followers || 0) / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.ratingRow}>
            {renderStars(influencerProfile?.rating || 4.5)}
          </View>
          <Text style={styles.statValue}>{(influencerProfile?.rating || 4.5).toFixed(1)}</Text>
          <Text style={styles.statLabel}>Note</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Campagnes</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("profile.about")}</Text>
          {!isEditingInfluencerAbout && (
            <Pressable onPress={() => {
              setEditFullName(influencerProfile?.fullName || "");
              setEditEmail(influencerProfile?.email || "");
              setEditBio(influencerProfile?.bio || "");
              setEditInstagram(influencerProfile?.instagramUrl || "");
              setEditTiktok(influencerProfile?.tiktokUrl || "");
              setEditFacebook(influencerProfile?.facebookUrl || "");
              setEditSnapchat(influencerProfile?.snapchatUrl || "");
              setEditPrimaryPlatform(influencerProfile?.primaryPlatform || "Instagram");
              setEditFollowersCount(influencerProfile?.followersCount?.toString() || "");
              setIsEditingInfluencerAbout(true);
            }}>
              <Edit2 size={20} color="#6366F1" />
            </Pressable>
          )}
        </View>

        {isEditingInfluencerAbout ? (
          <View style={styles.editContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom complet</Text>
              <TextInput
                style={styles.input}
                value={editFullName}
                onChangeText={setEditFullName}
                placeholder="Votre nom complet"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="email@exemple.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Instagram URL</Text>
              <TextInput
                style={styles.input}
                value={editInstagram}
                onChangeText={setEditInstagram}
                placeholder="https://instagram.com/username"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TikTok URL</Text>
              <TextInput
                style={styles.input}
                value={editTiktok}
                onChangeText={setEditTiktok}
                placeholder="https://tiktok.com/@username"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Facebook URL</Text>
              <TextInput
                style={styles.input}
                value={editFacebook}
                onChangeText={setEditFacebook}
                placeholder="https://facebook.com/username"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Snapchat URL</Text>
              <TextInput
                style={styles.input}
                value={editSnapchat}
                onChangeText={setEditSnapchat}
                placeholder="https://snapchat.com/add/username"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Parlez-nous de vous..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Plateforme principale *</Text>
              <View style={styles.platformSelector}>
                {["Instagram", "TikTok", "YouTube", "Facebook", "Snapchat"].map((platform) => (
                  <Pressable
                    key={platform}
                    style={[
                      styles.platformOption,
                      editPrimaryPlatform === platform && styles.platformOptionSelected,
                    ]}
                    onPress={() => setEditPrimaryPlatform(platform as typeof editPrimaryPlatform)}
                  >
                    <Text
                      style={[
                        styles.platformOptionText,
                        editPrimaryPlatform === platform && styles.platformOptionTextSelected,
                      ]}
                    >
                      {platform}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre d&apos;abonnés</Text>
              <TextInput
                style={styles.input}
                value={editFollowersCount}
                onChangeText={setEditFollowersCount}
                placeholder="Ex: 10000"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.editActions}>
              <Pressable style={styles.saveButton} onPress={handleSaveInfluencerAbout}>
                <Text style={styles.saveButtonText}>{t("common.save")}</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={handleCancelInfluencerEdit}>
                <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.infoItem}>
              <Mail size={20} color="#6B7280" />
              <Text style={styles.infoText}>{influencerProfile?.email}</Text>
            </View>
            
            {(influencerProfile?.instagramUrl || influencerProfile?.tiktokUrl || influencerProfile?.facebookUrl || influencerProfile?.snapchatUrl) && (
              <View style={styles.socialIcons}>
                {influencerProfile?.instagramUrl && (
                  <Pressable 
                    style={styles.socialIcon}
                    onPress={() => handleOpenSocialLink(influencerProfile.instagramUrl)}
                  >
                    <Instagram size={24} color="#E4405F" />
                  </Pressable>
                )}
                {influencerProfile?.tiktokUrl && (
                  <Pressable 
                    style={styles.socialIcon}
                    onPress={() => handleOpenSocialLink(influencerProfile.tiktokUrl)}
                  >
                    <Text style={styles.tiktokIcon}>🎵</Text>
                  </Pressable>
                )}
                {influencerProfile?.facebookUrl && (
                  <Pressable 
                    style={styles.socialIcon}
                    onPress={() => handleOpenSocialLink(influencerProfile.facebookUrl)}
                  >
                    <Facebook size={24} color="#1877F2" />
                  </Pressable>
                )}
                {influencerProfile?.snapchatUrl && (
                  <Pressable 
                    style={styles.socialIcon}
                    onPress={() => handleOpenSocialLink(influencerProfile.snapchatUrl)}
                  >
                    <Text style={styles.snapchatIcon}>👻</Text>
                  </Pressable>
                )}
              </View>
            )}

            {influencerProfile?.bio && (
              <Text style={styles.bioText}>{influencerProfile.bio}</Text>
            )}
          </>
        )}
      </View>

      <View style={styles.shareSection}>
        <Pressable style={styles.shareButton} onPress={handleShareProfile}>
          <Share2 size={20} color="#6366F1" />
          <Text style={styles.shareButtonText}>Partager le profil</Text>
        </Pressable>
        <Pressable style={styles.copyLinkButton} onPress={handleCopyProfileLink}>
          <Copy size={20} color="#6366F1" />
          <Text style={styles.copyLinkText}>Copier le lien</Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {userType === "brand" ? renderBrandProfile() : renderInfluencerProfile()}

      <View style={styles.actionsSection}>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push("/settings")}
        >
          <Settings size={20} color="#6366F1" />
          <Text style={styles.actionButtonText}>{t("profile.settings")}</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>{t("profile.logout")}</Text>
        </Pressable>
      </View>
    </ScrollView>
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
  profileHeader: {
    backgroundColor: "#FFFFFF",
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
  },
  brandAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#111827",
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 15,
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  infoSection: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
  },
  bioText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 15,
    color: "#6B7280",
  },
  actionsSection: {
    marginTop: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#EF4444",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6366F1",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  ratingRow: {
    flexDirection: "row",
    gap: 2,
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  editContainer: {
    marginTop: 8,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  shareSection: {
    marginTop: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: "#6366F1",
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  copyLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  copyLinkText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  socialLinksContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  socialLinksTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginBottom: 12,
  },
  socialIcons: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 12,
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tiktokIcon: {
    fontSize: 24,
  },
  snapchatIcon: {
    fontSize: 24,
  },
  platformSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  platformOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  platformOptionSelected: {
    backgroundColor: "#EEF2FF",
    borderColor: "#6366F1",
  },
  platformOptionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  platformOptionTextSelected: {
    color: "#6366F1",
  },
});
