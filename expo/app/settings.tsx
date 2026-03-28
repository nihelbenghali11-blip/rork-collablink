import { useRouter, Stack } from "expo-router";
import { ArrowLeft, Lock, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, Alert, TextInput } from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";

export default function SettingsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { logout } = useUser();
  
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [deletePassword, setDeletePassword] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const getPasswordStrength = (password: string): { label: string; color: string } => {
    if (password.length === 0) return { label: "", color: "#E5E7EB" };
    if (password.length < 6) return { label: t("settings.weak"), color: "#EF4444" };
    if (password.length < 10) return { label: t("settings.medium"), color: "#F59E0B" };
    return { label: t("settings.strong"), color: "#10B981" };
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t("common.error"), t("settings.fillAllFields"));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t("common.error"), t("settings.passwordsNotMatch"));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t("common.error"), t("settings.passwordTooShort"));
      return;
    }

    Alert.alert(t("common.success"), t("settings.passwordChanged"));
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert(t("common.error"), t("settings.enterPasswordToDelete"));
      return;
    }

    await logout();
    router.replace("/");
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t("profile.settings"),
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={24} color="#111827" />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={24} color="#6366F1" />
            <Text style={styles.sectionTitle}>{t("profile.changePassword")}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("settings.currentPassword")}</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t("settings.enterCurrentPassword")}
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("settings.newPassword")}</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t("settings.enterNewPassword")}
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={[styles.strengthBar, { backgroundColor: passwordStrength.color }]} />
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.label}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("settings.confirmPassword")}</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t("settings.confirmNewPassword")}
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>

          <Pressable style={styles.saveButton} onPress={handleChangePassword}>
            <Text style={styles.saveButtonText}>{t("common.save")}</Text>
          </Pressable>
        </View>

        <View style={styles.dangerSection}>
          <View style={styles.sectionHeader}>
            <Trash2 size={24} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: "#EF4444" }]}>
              {t("profile.deleteAccount")}
            </Text>
          </View>

          <Text style={styles.warningText}>{t("settings.deleteWarning")}</Text>

          {!showDeleteConfirm ? (
            <Pressable
              style={styles.deleteInitButton}
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Text style={styles.deleteInitButtonText}>{t("profile.deleteAccount")}</Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("settings.enterPasswordToDelete")}</Text>
                <TextInput
                  style={styles.input}
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  placeholder={t("settings.password")}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                />
              </View>

              <View style={styles.deleteActions}>
                <Pressable style={styles.cancelDeleteButton} onPress={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                }}>
                  <Text style={styles.cancelDeleteButtonText}>{t("common.cancel")}</Text>
                </Pressable>
                <Pressable style={styles.confirmDeleteButton} onPress={handleDeleteAccount}>
                  <Text style={styles.confirmDeleteButtonText}>
                    {t("settings.confirmDelete")}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  dangerSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
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
  strengthContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  saveButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  warningText: {
    fontSize: 14,
    color: "#DC2626",
    lineHeight: 20,
    marginBottom: 16,
  },
  deleteInitButton: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  deleteInitButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#EF4444",
  },
  deleteActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelDeleteButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelDeleteButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
