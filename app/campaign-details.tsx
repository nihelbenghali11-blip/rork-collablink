import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react-native";
import React, { useState } from "react";
import { 
  Alert,
  Modal, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  View 
} from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCampaigns } from "@/contexts/CampaignContext";
import { useUser } from "@/contexts/UserContext";
import { Collaborator } from "@/mocks/data";

const CURRENCIES = ["EUR", "USD", "GBP", "TND", "MAD", "AED"];

const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    TND: "د.ت",
    MAD: "د.م",
    AED: "د.إ",
  };
  return symbols[currency] || currency;
};

export default function CampaignDetailsPage() {
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();
  const router = useRouter();
  const { campaigns, updateCampaign, deleteCampaign } = useCampaigns();
  const { userType } = useUser();

  const campaign = campaigns.find((c) => c.id === id);

  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    campaign?.collaborators || []
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    amount: "",
    currency: "EUR",
  });
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [isEditingPlatforms, setIsEditingPlatforms] = useState(false);
  const [isEditingObjectives, setIsEditingObjectives] = useState(false);
  const [isEditingRequirements, setIsEditingRequirements] = useState(false);
  const [isEditingHashtags, setIsEditingHashtags] = useState(false);
  const [editedPlatforms, setEditedPlatforms] = useState<string[]>(campaign?.platforms || []);
  const [editedObjectives, setEditedObjectives] = useState(campaign?.objectives || "");
  const [editedRequirements, setEditedRequirements] = useState(campaign?.requirements || "");
  const [editedHashtags, setEditedHashtags] = useState(campaign?.hashtags || "");
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);

  const platformOptions = [
    { id: "instagram", name: "Instagram" },
    { id: "tiktok", name: "TikTok" },
    { id: "facebook", name: "Facebook" },
    { id: "snapchat", name: "Snapchat" },
  ];

  if (!campaign) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Campaign not found</Text>
      </View>
    );
  }

  const totalSpent = collaborators.reduce((sum, c) => sum + c.amount, 0);

  const handleAddCollaborator = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.amount) {
      return;
    }

    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
    };

    const updatedCollaborators = [...collaborators, newCollaborator];
    setCollaborators(updatedCollaborators);
    updateCampaign(campaign.id, { collaborators: updatedCollaborators });

    setFormData({ firstName: "", lastName: "", phone: "", amount: "", currency: "EUR" });
    setShowAddModal(false);
  };

  const handleEditCollaborator = () => {
    if (!editingId || !formData.firstName || !formData.lastName || !formData.phone || !formData.amount) {
      return;
    }

    const updatedCollaborators = collaborators.map((c) =>
      c.id === editingId
        ? {
            ...c,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
          }
        : c
    );

    setCollaborators(updatedCollaborators);
    updateCampaign(campaign.id, { collaborators: updatedCollaborators });

    setFormData({ firstName: "", lastName: "", phone: "", amount: "", currency: "EUR" });
    setEditingId(null);
    setShowAddModal(false);
  };

  const handleDeleteCollaborator = (id: string) => {
    const updatedCollaborators = collaborators.filter((c) => c.id !== id);
    setCollaborators(updatedCollaborators);
    updateCampaign(campaign.id, { collaborators: updatedCollaborators });
  };

  const openEditModal = (collaborator: Collaborator) => {
    setEditingId(collaborator.id);
    setFormData({
      firstName: collaborator.firstName,
      lastName: collaborator.lastName,
      phone: collaborator.phone,
      amount: collaborator.amount.toString(),
      currency: collaborator.currency,
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setFormData({ firstName: "", lastName: "", phone: "", amount: "", currency: "EUR" });
  };

  const handleDeleteCampaign = () => {
    Alert.alert(
      t("campaign.deleteCampaign"),
      t("campaign.confirmDelete"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            await deleteCampaign(campaign.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: campaign.name,
          headerShown: true,
          headerBackVisible: true,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("campaign.campaignName")}</Text>
          <Text style={styles.campaignName}>{campaign.name}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t("campaign.budget")}</Text>
            <Text style={styles.statValue}>{getCurrencySymbol(campaign.currency || "USD")} {campaign.budget.toLocaleString()}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t("dashboard.totalSpent")}</Text>
            <Text style={styles.statValue}>{getCurrencySymbol(campaign.currency || "USD")} {totalSpent.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("campaign.startDate")}</Text>
          <Text style={styles.detailText}>{campaign.startDate}</Text>
        </View>

        {userType === "influencer" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nom de la marque</Text>
            <Text style={styles.detailText}>{campaign.brandName}</Text>
          </View>
        )}

        {userType === "brand" && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("common.engagedInfluencers")} ({collaborators.length})
            </Text>
            <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Plus size={18} color="#FFF" />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </Pressable>
          </View>

          {collaborators.length > 0 ? (
            <View style={styles.collaboratorsList}>
              {collaborators.map((collaborator) => (
                <View key={collaborator.id} style={styles.collaboratorCard}>
                  <View style={styles.collaboratorInfo}>
                    <Text style={styles.collaboratorName}>
                      {collaborator.firstName} {collaborator.lastName}
                    </Text>
                    <Text style={styles.collaboratorDetails}>
                      {collaborator.phone} • {collaborator.amount} {collaborator.currency}
                    </Text>
                  </View>
                  <View style={styles.collaboratorActions}>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => openEditModal(collaborator)}
                    >
                      <Edit2 size={18} color="#6366F1" />
                    </Pressable>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => handleDeleteCollaborator(collaborator.id)}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>{t("common.noInfluencers")}</Text>
          )}
        </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("campaign.description")}</Text>
          <Text style={styles.detailText}>{campaign.description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("campaign.targetPlatform")}</Text>
            {!isEditingPlatforms && (
              <Pressable onPress={() => setIsEditingPlatforms(true)}>
                <Edit2 size={18} color="#6366F1" />
              </Pressable>
            )}
          </View>
          {isEditingPlatforms ? (
            <View>
              <Pressable
                style={styles.input}
                onPress={() => setShowPlatformPicker(!showPlatformPicker)}
              >
                <Text style={editedPlatforms.length > 0 ? styles.inputText : styles.placeholderText}>
                  {editedPlatforms.length > 0
                    ? editedPlatforms.map((pId) => platformOptions.find((p) => p.id === pId)?.name || pId).join(", ")
                    : "Select platforms"}
                </Text>
              </Pressable>
              {showPlatformPicker && (
                <View style={styles.pickerContainer}>
                  {platformOptions.map((p) => (
                    <Pressable
                      key={p.id}
                      style={styles.pickerOption}
                      onPress={() => {
                        if (editedPlatforms.includes(p.id)) {
                          setEditedPlatforms(editedPlatforms.filter((pId) => pId !== p.id));
                        } else {
                          setEditedPlatforms([...editedPlatforms, p.id]);
                        }
                      }}
                    >
                      <Text style={styles.pickerText}>{p.name}</Text>
                      {editedPlatforms.includes(p.id) && <Check size={20} color="#6366F1" />}
                    </Pressable>
                  ))}
                </View>
              )}
              <View style={styles.editActions}>
                <Pressable
                  style={styles.saveButton}
                  onPress={() => {
                    const platformNames = editedPlatforms.map((pId) => platformOptions.find((p) => p.id === pId)?.name || pId).join(", ");
                    updateCampaign(campaign.id, { platforms: editedPlatforms, platform: platformNames });
                    setIsEditingPlatforms(false);
                    setShowPlatformPicker(false);
                  }}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditedPlatforms(campaign?.platforms || []);
                    setIsEditingPlatforms(false);
                    setShowPlatformPicker(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Text style={styles.detailText}>
              {(campaign.platforms || [])
                .map((pId) => platformOptions.find((p) => p.id === pId)?.name || pId)
                .join(", ") || campaign.platform}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("campaign.objectives")}</Text>
            {!isEditingObjectives && (
              <Pressable onPress={() => setIsEditingObjectives(true)}>
                <Edit2 size={18} color="#6366F1" />
              </Pressable>
            )}
          </View>
          {isEditingObjectives ? (
            <View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t("campaign.objectivesPlaceholder")}
                placeholderTextColor="#9CA3AF"
                value={editedObjectives}
                onChangeText={setEditedObjectives}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <View style={styles.editActions}>
                <Pressable
                  style={styles.saveButton}
                  onPress={() => {
                    updateCampaign(campaign.id, { objectives: editedObjectives });
                    setIsEditingObjectives(false);
                  }}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditedObjectives(campaign?.objectives || "");
                    setIsEditingObjectives(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Text style={styles.detailText}>{campaign.objectives || "N/A"}</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("campaign.requirements")}</Text>
            {!isEditingRequirements && (
              <Pressable onPress={() => setIsEditingRequirements(true)}>
                <Edit2 size={18} color="#6366F1" />
              </Pressable>
            )}
          </View>
          {isEditingRequirements ? (
            <View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t("campaign.requirementsPlaceholder")}
                placeholderTextColor="#9CA3AF"
                value={editedRequirements}
                onChangeText={setEditedRequirements}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <View style={styles.editActions}>
                <Pressable
                  style={styles.saveButton}
                  onPress={() => {
                    updateCampaign(campaign.id, { requirements: editedRequirements });
                    setIsEditingRequirements(false);
                  }}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditedRequirements(campaign?.requirements || "");
                    setIsEditingRequirements(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Text style={styles.detailText}>{campaign.requirements || "N/A"}</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("campaign.hashtags")}</Text>
            {!isEditingHashtags && (
              <Pressable onPress={() => setIsEditingHashtags(true)}>
                <Edit2 size={18} color="#6366F1" />
              </Pressable>
            )}
          </View>
          {isEditingHashtags ? (
            <View>
              <TextInput
                style={styles.input}
                placeholder={t("campaign.hashtagsPlaceholder")}
                placeholderTextColor="#9CA3AF"
                value={editedHashtags}
                onChangeText={setEditedHashtags}
              />
              <View style={styles.editActions}>
                <Pressable
                  style={styles.saveButton}
                  onPress={() => {
                    updateCampaign(campaign.id, { hashtags: editedHashtags });
                    setIsEditingHashtags(false);
                  }}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditedHashtags(campaign?.hashtags || "");
                    setIsEditingHashtags(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Text style={styles.hashtagText}>{campaign.hashtags || "N/A"}</Text>
          )}
        </View>

        <View style={styles.deleteSection}>
          <Pressable style={styles.deleteCampaignButton} onPress={handleDeleteCampaign}>
            <Trash2 size={20} color="#FFF" />
            <Text style={styles.deleteCampaignButtonText}>{t("campaign.deleteCampaign")}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? t("common.edit") : "Ajouter"} Collaborateur
              </Text>
              <Pressable onPress={closeModal}>
                <X size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prénom</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Entrez le prénom"
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Entrez le nom"
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Numéro de téléphone</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="+33 6 12 34 56 78"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Montant convenu</Text>
                <View style={styles.amountRow}>
                  <TextInput
                    style={[styles.modalInput, styles.amountInput]}
                    placeholder="1000"
                    keyboardType="numeric"
                    value={formData.amount}
                    onChangeText={(text) => setFormData({ ...formData, amount: text })}
                  />
                  <Pressable
                    style={styles.currencyPicker}
                    onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                  >
                    <Text style={styles.currencyText}>{formData.currency}</Text>
                  </Pressable>
                </View>
                {showCurrencyPicker && (
                  <View style={styles.currencyList}>
                    {CURRENCIES.map((currency) => (
                      <Pressable
                        key={currency}
                        style={styles.currencyOption}
                        onPress={() => {
                          setFormData({ ...formData, currency });
                          setShowCurrencyPicker(false);
                        }}
                      >
                        <Text style={styles.currencyOptionText}>{currency}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <Pressable
                style={styles.submitButton}
                onPress={editingId ? handleEditCollaborator : handleAddCollaborator}
              >
                <Text style={styles.submitButtonText}>
                  {editingId ? t("common.save") : "Ajouter"}
                </Text>
              </Pressable>
            </ScrollView>
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
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#6B7280",
    textTransform: "uppercase" as const,
    marginBottom: 8,
  },
  campaignName: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#111827",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#111827",
  },
  detailText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  hashtagText: {
    fontSize: 16,
    color: "#6366F1",
    fontWeight: "600" as const,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  inputText: {
    fontSize: 16,
    color: "#111827",
  },
  placeholderText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  pickerText: {
    fontSize: 16,
    color: "#111827",
  },
  editActions: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center" as const,
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
    paddingVertical: 12,
    alignItems: "center" as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#6366F1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  collaboratorsList: {
    gap: 12,
  },
  collaboratorCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  collaboratorInfo: {
    flex: 1,
  },
  collaboratorName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 4,
  },
  collaboratorDetails: {
    fontSize: 14,
    color: "#6B7280",
  },
  collaboratorActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  amountRow: {
    flexDirection: "row",
    gap: 12,
  },
  amountInput: {
    flex: 1,
  },
  currencyPicker: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minWidth: 80,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
  },
  currencyList: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  currencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  currencyOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  submitButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  deleteSection: {
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 24,
  },
  deleteCampaignButton: {
    flexDirection: "row",
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  deleteCampaignButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
