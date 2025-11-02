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

  const [editedPlatforms, setEditedPlatforms] = useState<string[]>([]);
  const [editedObjectives, setEditedObjectives] = useState("");
  const [editedRequirements, setEditedRequirements] = useState("");
  const [editedHashtags, setEditedHashtags] = useState("");
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);

  const platformOptions = [
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
                {t("common.engagedInfluencers")} ({collaborators.length})
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
  // ... keep your styles unchanged
});
