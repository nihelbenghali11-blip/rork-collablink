import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCampaigns } from "@/contexts/CampaignContext";
import { useUser } from "@/contexts/UserContext";
import { Collaborator } from "@/mocks/data";
import { trpc } from "@/lib/trpc";

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

type FormDataState = {
  firstName: string;
  lastName: string;
  phone: string;
  amount: string;
  currency: string;
};

type PlatformOption = { id: string; name: string };

export default function CampaignDetailsPage() {
  // 1. All hooks. No early returns above this line.

  // read route param
  const { id } = useLocalSearchParams();
  const campaignId = useMemo(
    () => (Array.isArray(id) ? id[0] : id) ?? "",
    [id]
  );

  // contexts
  const { t } = useLanguage();
  const router = useRouter();
  const { updateCampaign, deleteCampaign } = useCampaigns();
  const { userType } = useUser();

  // queries
  const getQuery = trpc.campaigns.legacy.get.useQuery(
    { id: campaignId },
    { enabled: !!campaignId }
  );

  const collaboratorsQuery = trpc.collaborators.list.useQuery(
    { campaign_id: campaignId },
    { enabled: !!campaignId }
  );

  // mutation hooks
  const createCollaboratorMutation = trpc.collaborators.create.useMutation();
  const updateCollaboratorMutation = trpc.collaborators.update.useMutation();
  const deleteCollaboratorMutation = trpc.collaborators.delete.useMutation();
  const deleteMutation = trpc.campaigns.delete.useMutation();

  // derived data from queries
  const dbCampaign = getQuery.data as any;

  // local state
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataState>({
    firstName: "",
    lastName: "",
    phone: "",
    amount: "",
    currency: "EUR",
  });
  const [showCurrencyPicker, setShowCurrencyPicker] = useState<boolean>(false);

  const [isEditingPlatforms, setIsEditingPlatforms] = useState<boolean>(false);
  const [isEditingObjectives, setIsEditingObjectives] = useState<boolean>(false);
  const [isEditingRequirements, setIsEditingRequirements] = useState<boolean>(false);
  const [isEditingHashtags, setIsEditingHashtags] = useState<boolean>(false);

  const [editedPlatforms, setEditedPlatforms] = useState<string[]>([]);
  const [editedObjectives, setEditedObjectives] = useState<string>("");
  const [editedRequirements, setEditedRequirements] = useState<string>("");
  const [editedHashtags, setEditedHashtags] = useState<string>("");
  const [showPlatformPicker, setShowPlatformPicker] = useState<boolean>(false);

  const platformOptions: PlatformOption[] = [
    { id: "instagram", name: "Instagram" },
    { id: "tiktok", name: "TikTok" },
    { id: "facebook", name: "Facebook" },
    { id: "snapchat", name: "Snapchat" },
  ];

  // effects
  useEffect(() => {
    if (dbCampaign) {
      setEditedObjectives(dbCampaign.objectives || "");
      setEditedRequirements(dbCampaign.requirements || "");
      setEditedHashtags(dbCampaign.hashtags || "");
      if (Array.isArray(dbCampaign.collaborators)) {
        const mapped: Collaborator[] = (dbCampaign.collaborators as any[])
          .filter((c: any) => !c.deleted_at)
          .map((c: any) => ({
            id: c.id,
            firstName: c.first_name,
            lastName: c.last_name,
            phone: c.phone ?? "",
            amount: c.agreed_amount ?? 0,
            currency: c.currency ?? "EUR",
          }));
        setCollaborators(mapped);
      }
    }
  }, [dbCampaign]);

  useEffect(() => {
    if (collaboratorsQuery.data) {
      const mapped: Collaborator[] = collaboratorsQuery.data.map((c: any) => ({
        id: c.id,
        firstName: c.first_name,
        lastName: c.last_name,
        phone: c.phone ?? "",
        amount: c.agreed_amount,
        currency: c.currency,
      }));
      setCollaborators(mapped);
    }
  }, [collaboratorsQuery.data]);

  // derived values
  const totalSpent = collaborators.reduce((sum, c) => sum + c.amount, 0);

  const engagedCount = useMemo(() => {
    const fromState = collaborators.length;
    const fromCampaign = Array.isArray(dbCampaign?.collaborators)
      ? (dbCampaign.collaborators as any[]).filter((c: any) => !c.deleted_at).length
      : 0;
    return Math.max(fromState, fromCampaign);
  }, [collaborators.length, dbCampaign?.collaborators]);

  // handlers (they are closures over stable hooks above)
  const handleAddCollaborator = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.amount
    ) {
      Alert.alert(t("common.error"), "Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      console.log("[handleAddCollaborator] Starting to add collaborator for campaign:", campaignId);
      const result = await createCollaboratorMutation.mutateAsync({
        campaign_id: campaignId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        agreed_amount: parseFloat(formData.amount),
        currency: formData.currency,
        ad_status: "Active",
      });

      console.log("[handleAddCollaborator] Successfully created collaborator:", result.id);

      const newCollaborator: Collaborator = {
        id: result.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
      };

      const updatedCollaborators = [...collaborators, newCollaborator];
      setCollaborators(updatedCollaborators);
      updateCampaign(campaignId, { collaborators: updatedCollaborators });

      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        amount: "",
        currency: "EUR",
      });
      setShowAddModal(false);
      await collaboratorsQuery.refetch();
    } catch (error: any) {
      console.error("[handleAddCollaborator] Failed to add collaborator:", error);
      const errorMessage =
        error?.message ||
        "Failed to add collaborator: " +
          (error?.toString() || "Unknown error");
      Alert.alert(t("common.error"), errorMessage);
    }
  };

  const handleEditCollaborator = async () => {
    if (
      !editingId ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.amount
    ) {
      return;
    }

    try {
      await updateCollaboratorMutation.mutateAsync({
        id: editingId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        agreed_amount: parseFloat(formData.amount),
        currency: formData.currency,
      });

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
      updateCampaign(campaignId, { collaborators: updatedCollaborators });

      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        amount: "",
        currency: "EUR",
      });
      setEditingId(null);
      setShowAddModal(false);
      await collaboratorsQuery.refetch();
    } catch (error) {
      console.error("Failed to update collaborator:", error);
      Alert.alert(t("common.error"), "Failed to update collaborator");
    }
  };

  const handleDeleteCollaborator = async (idToDelete: string) => {
    try {
      await deleteCollaboratorMutation.mutateAsync({ id: idToDelete });
      const updatedCollaborators = collaborators.filter(
        (c) => c.id !== idToDelete
      );
      setCollaborators(updatedCollaborators);
      updateCampaign(campaignId, { collaborators: updatedCollaborators });
      await collaboratorsQuery.refetch();
    } catch (error) {
      console.error("Failed to delete collaborator:", error);
      Alert.alert(t("common.error"), "Failed to delete collaborator");
    }
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
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      amount: "",
      currency: "EUR",
    });
  };

  const handleDeleteCampaign = () => {
    Alert.alert(t("campaign.deleteCampaign"), t("campaign.confirmDelete"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync({ id: campaignId });
            await deleteCampaign(campaignId);
            router.back();
          } catch (error) {
            console.error("Failed to delete campaign:", error);
            Alert.alert(t("common.error"), "Failed to delete campaign");
          }
        },
      },
    ]);
  };

  // 2. After all hooks are declared, now we can branch and return.

  if (!campaignId) {
    return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Invalid campaign</Text>
        </View>
    );
  }

  if (getQuery.isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.detailText}>Loading...</Text>
      </View>
    );
  }

  if (getQuery.error || !dbCampaign) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Campaign not found</Text>
      </View>
    );
  }

  // 3. Normal UI render
  return (
    <>
      <Stack.Screen
        options={{
          title: dbCampaign.name,
          headerShown: true,
          headerBackVisible: true,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("campaign.campaignName")}</Text>
          <Text style={styles.campaignName}>{dbCampaign.name}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t("campaign.budget")}</Text>
            <Text style={styles.statValue}>
              {getCurrencySymbol(dbCampaign.revenue_currency || "EUR")}{" "}
              {(dbCampaign.revenue_amount ?? 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t("dashboard.totalSpent")}</Text>
            <Text style={styles.statValue}>
              {getCurrencySymbol(dbCampaign.revenue_currency || "EUR")}{" "}
              {totalSpent.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("campaign.startDate")}</Text>
          <Text style={styles.detailText}>{dbCampaign.start_date || ""}</Text>
        </View>

        {userType === "brand" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t("common.engagedInfluencers")} ({engagedCount})
              </Text>
              <Pressable
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Plus size={18} color="#FFF" />
                <Text style={styles.addButtonText}>Ajouter</Text>
              </Pressable>
            </View>

            {collaborators.length > 0 ? (
              <View style={styles.collaboratorsList}>
                {collaborators.map((collaborator) => (
                  <View
                    key={collaborator.id}
                    style={styles.collaboratorCard}
                  >
                    <View style={styles.collaboratorInfo}>
                      <Text style={styles.collaboratorName}>
                        {collaborator.firstName} {collaborator.lastName}
                      </Text>
                      <Text style={styles.collaboratorDetails}>
                        {collaborator.phone} • {collaborator.amount}{" "}
                        {collaborator.currency}
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
                        onPress={() =>
                          handleDeleteCollaborator(collaborator.id)
                        }
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
          <Text style={styles.detailText}>{dbCampaign.description}</Text>
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
                onPress={() =>
                  setShowPlatformPicker(!showPlatformPicker)
                }
              >
                <Text
                  style={
                    editedPlatforms.length > 0
                      ? styles.inputText
                      : styles.placeholderText
                  }
                >
                  {editedPlatforms.length > 0
                    ? editedPlatforms
                        .map(
                          (pId) =>
                            platformOptions.find(
                              (p) => p.id === pId
                            )?.name || pId
                        )
                        .join(", ")
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
                          setEditedPlatforms(
                            editedPlatforms.filter(
                              (pId) => pId !== p.id
                            )
                          );
                        } else {
                          setEditedPlatforms([
                            ...editedPlatforms,
                            p.id,
                          ]);
                        }
                      }}
                    >
                      <Text style={styles.pickerText}>{p.name}</Text>
                      {editedPlatforms.includes(p.id) && (
                        <Check size={20} color="#6366F1" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
              <View style={styles.editActions}>
                <Pressable
                  style={styles.saveButton}
                  onPress={() => {
                    const platformNames = editedPlatforms
                      .map(
                        (pId) =>
                          platformOptions.find(
                            (p) => p.id === pId
                          )?.name || pId
                      )
                      .join(", ");
                    updateCampaign(campaignId, {
                      platforms: editedPlatforms,
                      platform: platformNames,
                    });
                    setIsEditingPlatforms(false);
                    setShowPlatformPicker(false);
                  }}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditedPlatforms([]);
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
              {(dbCampaign.platforms || [])
                .map((p: any) => p.platform)
                .join(", ")}
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
                    updateCampaign(campaignId, {
                      objectives: editedObjectives,
                    });
                    setIsEditingObjectives(false);
                  }}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditedObjectives("");
                    setIsEditingObjectives(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Text style={styles.detailText}>
              {editedObjectives || "N/A"}
            </Text>
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
                    updateCampaign(campaignId, {
                      requirements: editedRequirements,
                    });
                    setIsEditingRequirements(false);
                  }}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditedRequirements("");
                    setIsEditingRequirements(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Text style={styles.detailText}>
              {editedRequirements || "N/A"}
            </Text>
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
                    updateCampaign(campaignId, {
                      hashtags: editedHashtags,
                    });
                    setIsEditingHashtags(false);
                  }}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditedHashtags("");
                    setIsEditingHashtags(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Text style={styles.hashtagText}>
              {editedHashtags || "N/A"}
            </Text>
          )}
        </View>

        <View style={styles.deleteSection}>
          <Pressable
            style={styles.deleteCampaignButton}
            onPress={handleDeleteCampaign}
            testID="btn-delete-campaign"
          >
            <Trash2 size={20} color="#FFF" />
            <Text style={styles.deleteCampaignButtonText}>
              {t("campaign.deleteCampaign")}
            </Text>
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
                  onChangeText={(text) =>
                    setFormData({ ...formData, firstName: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Entrez le nom"
                  value={formData.lastName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, lastName: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Numéro de téléphone</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="+33 6 12 34 56 78"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
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
                    onChangeText={(text) =>
                      setFormData({ ...formData, amount: text })
                    }
                  />
                  <Pressable
                    style={styles.currencyPicker}
                    onPress={() =>
                      setShowCurrencyPicker(!showCurrencyPicker)
                    }
                  >
                    <Text style={styles.currencyText}>
                      {formData.currency}
                    </Text>
                  </Pressable>
                </View>
                {showCurrencyPicker && (
                  <View style={styles.currencyList}>
                    {CURRENCIES.map((currency) => (
                      <Pressable
                        key={currency}
                        style={styles.currencyOption}
                        onPress={() => {
                          setFormData({
                            ...formData,
                            currency,
                          });
                          setShowCurrencyPicker(false);
                        }}
                      >
                        <Text style={styles.currencyOptionText}>
                          {currency}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <Pressable
                style={styles.submitButton}
                onPress={
                  editingId
                    ? handleEditCollaborator
                    : handleAddCollaborator
                }
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
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  campaignName: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  detailText: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
  },
  collaboratorsList: {
    marginTop: 8,
    gap: 10,
  },
  collaboratorCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  collaboratorInfo: {
    flex: 1,
  },
  collaboratorName: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },
  collaboratorDetails: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 2,
  },
  collaboratorActions: {
    flexDirection: "row",
    gap: 6,
    marginLeft: 10,
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 100,
  },
  inputText: {
    color: "#111827",
  },
  placeholderText: {
    color: "#6B7280",
  },
  pickerContainer: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  pickerText: {
    color: "#111827",
    fontSize: 14,
  },
  editActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  hashtagText: {
    color: "#111827",
    fontSize: 14,
  },
  deleteSection: {
    marginTop: 8,
  },
  deleteCampaignButton: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  deleteCampaignButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    color: "#6B7280",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
  },
  amountRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  amountInput: {
    flex: 1,
  },
  currencyPicker: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  currencyText: {
    color: "#111827",
    fontWeight: "600",
  },
  currencyList: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  currencyOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  currencyOptionText: {
    color: "#111827",
    fontSize: 14,
  },
  submitButton: {
    marginTop: 4,
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
  },
});
