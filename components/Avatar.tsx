import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { getBaseUrl } from "@/lib/trpc";

export type AvatarProps = {
  userId?: string | null;
  uri?: string | null;
  name?: string | null;
  size?: number; // px
  rounded?: boolean;
  preferBlob?: boolean;
  testID?: string;
};

export default function Avatar({
  userId,
  uri,
  name,
  size = 48,
  rounded = true,
  preferBlob = false,
  testID,
}: AvatarProps) {
  const [hadError, setHadError] = useState<boolean>(false);

  const displayUri = useMemo(() => {
    if (hadError) return null;
    const cleanUri = (uri && uri.length > 0) ? uri : null;
    if (preferBlob && userId) return `${getBaseUrl()}/api/users/${userId}/avatar`;
    if (cleanUri) return cleanUri;
    if (userId) return `${getBaseUrl()}/api/users/${userId}/avatar`;
    return null;
  }, [hadError, preferBlob, uri, userId]);

  const initials = useMemo(() => {
    const value = (name ?? "").trim();
    if (value.length === 0) return "?";
    const parts = value.split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const second = parts.length > 1 ? parts[1]?.[0] ?? "" : "";
    return (first + second).toUpperCase();
  }, [name]);

  const containerStyle = useMemo(() => [
    styles.container,
    {
      width: size,
      height: size,
      borderRadius: rounded ? size / 2 : 12,
    },
  ], [size, rounded]);

  const imageStyle = useMemo(() => [
    styles.image,
    {
      width: size,
      height: size,
      borderRadius: rounded ? size / 2 : 12,
    },
  ], [size, rounded]);

  if (!displayUri) {
    return (
      <View style={containerStyle} testID={testID ? `${testID}-fallback` : undefined}>
        <Text style={styles.initials} numberOfLines={1}>
          {initials}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: displayUri }}
      style={imageStyle}
      contentFit="cover"
      onError={() => setHadError(true)}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    backgroundColor: "#F3F4F6",
  },
  initials: {
    color: "#111827",
    fontWeight: "700" as const,
    fontSize: 16,
  },
});
