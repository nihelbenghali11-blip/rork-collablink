import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "./UserContext";

const MESSAGES_KEY = "@collablink_messages";
const CONVERSATIONS_KEY = "@collablink_conversations";

export interface MessageAttachment {
  id: string;
  type: "image" | "document";
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  userId: string;
  text: string;
  sender: "user" | "influencer";
  timestamp: string;
  attachments?: MessageAttachment[];
}

export interface Conversation {
  id: string;
  userId: string;
  influencerId: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

const getInitialConversations = (userId: string): Conversation[] => [
  {
    id: `${userId}_1`,
    userId,
    influencerId: "1",
    lastMessage: "Thank you for reaching out! I'd love to discuss this collaboration opportunity.",
    timestamp: "2h ago",
    unread: true,
  },
  {
    id: `${userId}_2`,
    userId,
    influencerId: "2",
    lastMessage: "I've reviewed your campaign brief and I have a few questions.",
    timestamp: "5h ago",
    unread: false,
  },
  {
    id: `${userId}_3`,
    userId,
    influencerId: "5",
    lastMessage: "The content is ready for your review. Let me know your thoughts!",
    timestamp: "1d ago",
    unread: true,
  },
  {
    id: `${userId}_4`,
    userId,
    influencerId: "3",
    lastMessage: "Perfect! I'll start working on the content this week.",
    timestamp: "2d ago",
    unread: false,
  },
];

const getInitialMessages = (userId: string, conversationIds: string[]): { [key: string]: Message[] } => {
  const messages: { [key: string]: Message[] } = {};
  
  conversationIds.forEach((convId, index) => {
    switch (index) {
      case 0:
        messages[convId] = [
          {
            id: `${convId}_1`,
            conversationId: convId,
            userId,
            text: "Hi! I saw your campaign and I'm very interested in collaborating with your brand.",
            sender: "influencer",
            timestamp: "10:30 AM",
          },
          {
            id: `${convId}_2`,
            conversationId: convId,
            userId,
            text: "Great! Let me tell you more about the campaign details.",
            sender: "user",
            timestamp: "10:35 AM",
          },
          {
            id: `${convId}_3`,
            conversationId: convId,
            userId,
            text: "Thank you for reaching out! I'd love to discuss this collaboration opportunity.",
            sender: "influencer",
            timestamp: "10:40 AM",
          },
        ];
        break;
      case 1:
        messages[convId] = [
          {
            id: `${convId}_1`,
            conversationId: convId,
            userId,
            text: "Hello! I have some questions about the campaign requirements.",
            sender: "influencer",
            timestamp: "2:15 PM",
          },
          {
            id: `${convId}_2`,
            conversationId: convId,
            userId,
            text: "Sure, feel free to ask anything.",
            sender: "user",
            timestamp: "2:20 PM",
          },
          {
            id: `${convId}_3`,
            conversationId: convId,
            userId,
            text: "I've reviewed your campaign brief and I have a few questions.",
            sender: "influencer",
            timestamp: "2:25 PM",
          },
        ];
        break;
      case 2:
        messages[convId] = [
          {
            id: `${convId}_1`,
            conversationId: convId,
            userId,
            text: "The content is ready for your review. Let me know your thoughts!",
            sender: "influencer",
            timestamp: "Yesterday",
          },
        ];
        break;
      case 3:
        messages[convId] = [
          {
            id: `${convId}_1`,
            conversationId: convId,
            userId,
            text: "Looking forward to working on this campaign!",
            sender: "influencer",
            timestamp: "2 days ago",
          },
          {
            id: `${convId}_2`,
            conversationId: convId,
            userId,
            text: "Perfect! I'll start working on the content this week.",
            sender: "influencer",
            timestamp: "2 days ago",
          },
        ];
        break;
    }
  });
  
  return messages;
};

export const [MessagingProvider, useMessaging] = createContextHook(() => {
  const { currentUserId, isLoading: userLoading } = useUser();
  const [allMessages, setAllMessages] = useState<{ [key: string]: { [key: string]: Message[] } }>({});
  const [allConversations, setAllConversations] = useState<{ [key: string]: Conversation[] }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!userLoading && currentUserId && !allConversations[currentUserId]) {
      initializeUserData(currentUserId);
    }
  }, [currentUserId, allConversations, userLoading]);

  const loadData = async () => {
    try {
      const [storedMessages, storedConversations] = await Promise.all([
        AsyncStorage.getItem(MESSAGES_KEY),
        AsyncStorage.getItem(CONVERSATIONS_KEY),
      ]);

      if (storedMessages) {
        setAllMessages(JSON.parse(storedMessages));
      }

      if (storedConversations) {
        setAllConversations(JSON.parse(storedConversations));
      }
    } catch (error) {
      console.error("Failed to load messaging data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeUserData = (userId: string) => {
    const initialConvs = getInitialConversations(userId);
    const conversationIds = initialConvs.map(c => c.id);
    const initialMsgs = getInitialMessages(userId, conversationIds);

    setAllConversations(prev => ({
      ...prev,
      [userId]: initialConvs,
    }));

    setAllMessages(prev => ({
      ...prev,
      [userId]: initialMsgs,
    }));
  };

  const saveAllMessages = async (newMessages: { [key: string]: { [key: string]: Message[] } }) => {
    try {
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.error("Failed to save messages:", error);
    }
  };

  const saveAllConversations = async (newConversations: { [key: string]: Conversation[] }) => {
    try {
      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(newConversations));
    } catch (error) {
      console.error("Failed to save conversations:", error);
    }
  };

  const getConversationMessages = useCallback((conversationId: string): Message[] => {
    if (!currentUserId) return [];
    const userMessages = allMessages[currentUserId] || {};
    return userMessages[conversationId] || [];
  }, [allMessages, currentUserId]);

  const addMessage = useCallback(async (
    conversationId: string,
    text: string,
    sender: "user" | "influencer",
    attachments?: MessageAttachment[]
  ) => {
    if (!currentUserId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId,
      userId: currentUserId,
      text,
      sender,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments,
    };

    const userMessages = allMessages[currentUserId] || {};
    const updatedUserMessages = {
      ...userMessages,
      [conversationId]: [...(userMessages[conversationId] || []), newMessage],
    };

    const updatedAllMessages = {
      ...allMessages,
      [currentUserId]: updatedUserMessages,
    };

    setAllMessages(updatedAllMessages);
    await saveAllMessages(updatedAllMessages);

    const userConversations = allConversations[currentUserId] || [];
    const updatedUserConversations = userConversations.map((conv) => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: text || (attachments && attachments.length > 0 ? "📎 Attachment" : ""),
          timestamp: "Just now",
          unread: sender === "influencer",
        };
      }
      return conv;
    });

    const updatedAllConversations = {
      ...allConversations,
      [currentUserId]: updatedUserConversations,
    };

    setAllConversations(updatedAllConversations);
    await saveAllConversations(updatedAllConversations);

    return newMessage;
  }, [allMessages, allConversations, currentUserId]);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!currentUserId) return;

    const userConversations = allConversations[currentUserId] || [];
    const updatedUserConversations = userConversations.map((conv) =>
      conv.id === conversationId ? { ...conv, unread: false } : conv
    );

    const updatedAllConversations = {
      ...allConversations,
      [currentUserId]: updatedUserConversations,
    };

    setAllConversations(updatedAllConversations);
    await saveAllConversations(updatedAllConversations);
  }, [allConversations, currentUserId]);

  const getUnreadCount = useCallback(() => {
    if (!currentUserId) return 0;
    const userConversations = allConversations[currentUserId] || [];
    return userConversations.filter((conv) => conv.unread).length;
  }, [allConversations, currentUserId]);

  const conversations = useMemo(() => {
    if (!currentUserId) return [];
    return allConversations[currentUserId] || [];
  }, [allConversations, currentUserId]);

  return useMemo(() => ({
    conversations,
    isLoading,
    getConversationMessages,
    addMessage,
    markAsRead,
    getUnreadCount,
  }), [
    conversations,
    isLoading,
    getConversationMessages,
    addMessage,
    markAsRead,
    getUnreadCount,
  ]);
});
