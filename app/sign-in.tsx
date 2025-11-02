import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useUser } from "@/contexts/UserContext";

export default function SignInPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { setBrandProfile, setInfluencerProfile } = useUser();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const loginMutation = trpc.users.login.useMutation();
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const user = await loginMutation.mutateAsync({ email, password });
      const profileId = Date.now().toString();

      if (user.role === "brand") {
        await setBrandProfile({
          id: profileId,
          userId: user.id,
          companyName: user.name ?? "",
          industry: user.sector ?? "",
          email: user.email,
          description: user.bio ?? undefined,
        });
      } else {
        await setInfluencerProfile({
          id: profileId,
          userId: user.id,
          username: user.name ?? "",
          fullName: user.name ?? "",
          email: user.email,
          mainPlatform: user.primary_platform ?? "Instagram",
          followers: user.followers_count ?? 0,
          bio: user.bio ?? undefined,
        });
      }

      router.replace("/(tabs)/dashboard" as any);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      Alert.alert("Sign in failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t("auth.signIn")}</Text>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("auth.email")}</Text>
            <TextInput
              testID="signin-email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("auth.password")}</Text>
            <TextInput
              testID="signin-password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />
          </View>
          <Pressable
            testID="signin-submit"
            style={[styles.button, !(email && password) && styles.buttonDisabled]}
            disabled={!(email && password) || loading}
            onPress={onSubmit}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{t("auth.signIn")}</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: "800" as const, color: "#111827", marginBottom: 24 },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" as const, color: "#374151" },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: "#D1D5DB" },
  buttonText: { color: "#FFFFFF", fontWeight: "700" as const, fontSize: 16 },
});