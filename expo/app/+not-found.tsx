import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <AlertCircle size={64} color="#6366F1" />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>This screen doesn&apos;t exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#111827",
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  link: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
