import { Tabs } from "expo-router";
import { LayoutDashboard, Search, MessageCircle, User } from "lucide-react-native";
import React, { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { trpc } from "@/lib/trpc";

export default function TabLayout() {
  const { t } = useLanguage();
  const { currentUserId } = useUser();
  const convQuery = trpc.messaging.listConversations.useQuery(undefined, { enabled: !!currentUserId });
  const unreadCount = useMemo(() => {
    const list = convQuery.data ?? [];
    if (!currentUserId) return 0;
    return list.reduce((acc: number, c: any) => {
      const count = c.user_a_id === currentUserId ? (c.unread_a ?? 0) : (c.unread_b ?? 0);
      return acc + (Number.isFinite(count) ? count : 0);
    }, 0);
  }, [convQuery.data, currentUserId]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: true,
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "700",
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("dashboard.overview"),
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("search.title"),
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messaging"
        options={{
          title: t("messaging.title"),
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile.myProfile"),
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
