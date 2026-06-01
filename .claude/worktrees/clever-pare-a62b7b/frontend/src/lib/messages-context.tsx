"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  getCurrentUser,
  getUserConsultations,
  getConsultationMessages,
  sendMessage as sendSupabaseMessage,
  subscribeToMessages,
  getUserProfile,
  getLawyerProfile,
} from "./supabase";

interface Message {
  id: string;
  sender: "client" | "lawyer";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

interface Chat {
  id: string;
  consultationId: string;
  lawyerName: string;
  lawyerSpecialization: string;
  avatar: string;
  online: boolean;
  verified: boolean;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
  caseDescription?: string;
  isPending?: boolean;
  lawyerDetails?: {
    fullName?: string;
    phone?: string;
    email?: string;
    rating?: number;
  };
}

interface MessagesContextType {
  chats: Chat[];
  loading: boolean;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  getTotalUnread: () => number;
  markAsRead: (chatId: string) => void;
  sendMessage: (consultationId: string, messageText: string) => Promise<void>;
  loadMessagesForConsultation: (consultationId: string) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined,
);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<'client' | 'lawyer' | null>(null);
  const subscriptionsRef = useRef<Map<string, any>>(new Map());

  // Load user and initial chats from Supabase
  useEffect(() => {
    const loadChatsFromSupabase = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setLoading(false);
          return;
        }

        const userProfile = await getUserProfile(currentUser.id);
        if (!userProfile) {
          setLoading(false);
          return;
        }

        setUserId(currentUser.id);
        setUserType(userProfile.user_type);

        // Get all consultations for the user
        const consultations = await getUserConsultations(
          currentUser.id,
          userProfile.user_type
        );

        // Format consultations into chats
        const formattedChats: Chat[] = await Promise.all(
          consultations.map(async (consultation: any) => {
            // Get the other party's details
            const otherPartyId = userProfile.user_type === 'client' 
              ? consultation.lawyer_id 
              : consultation.client_id;
            
            const otherPartyProfile = await getUserProfile(otherPartyId);
            const lawyerProfile = userProfile.user_type === 'lawyer' 
              ? await getLawyerProfile(currentUser.id)
              : await getLawyerProfile(consultation.lawyer_id);

            // Get messages for this consultation
            const messages = await getConsultationMessages(consultation.id);
            
            // Calculate unread count (messages from other party that are unread)
            const unreadCount = messages.filter((msg: any) => 
              msg.sender_id === otherPartyId && msg.status !== 'read'
            ).length;

            const lastMessage = messages.length > 0 
              ? messages[messages.length - 1].message_text 
              : 'No messages yet';

            const lastTimestamp = messages.length > 0
              ? messages[messages.length - 1].created_at
              : consultation.created_at;

            return {
              id: consultation.id,
              consultationId: consultation.id,
              lawyerName: userProfile.user_type === 'client'
                ? otherPartyProfile?.full_name || 'Unknown'
                : userProfile.full_name,
              lawyerSpecialization: lawyerProfile?.specialization || 'General Law',
              avatar: otherPartyProfile?.profile_image_url || '/default-avatar.png',
              online: false, // TODO: Implement online status
              verified: lawyerProfile?.verified || false,
              lastMessage,
              timestamp: lastTimestamp,
              unread: unreadCount,
              messages: messages.map((msg: any) => ({
                id: msg.id,
                sender: msg.sender_id === currentUser.id 
                  ? userProfile.user_type 
                  : (userProfile.user_type === 'client' ? 'lawyer' : 'client'),
                text: msg.message_text,
                timestamp: msg.created_at,
                status: msg.status || 'sent'
              })),
              caseDescription: consultation.description,
              isPending: consultation.status === 'pending',
              lawyerDetails: {
                fullName: otherPartyProfile?.full_name,
                phone: otherPartyProfile?.phone,
                email: otherPartyProfile?.email,
                rating: lawyerProfile?.rating || 0
              }
            };
          })
        );

        setChats(formattedChats);

        // Subscribe to real-time updates for each consultation
        formattedChats.forEach(chat => {
          const subscription = subscribeToMessages(
            chat.consultationId,
            (payload) => {
              // Handle new message
              if (payload.eventType === 'INSERT') {
                const newMessage = payload.new;
                setChats(prev => prev.map(c => {
                  if (c.consultationId === chat.consultationId) {
                    const isOwnMessage = newMessage.sender_id === currentUser.id;
                    return {
                      ...c,
                      messages: [...c.messages, {
                        id: newMessage.id,
                        sender: isOwnMessage ? userProfile.user_type : (userProfile.user_type === 'client' ? 'lawyer' : 'client'),
                        text: newMessage.message_text,
                        timestamp: newMessage.created_at,
                        status: newMessage.status || 'sent'
                      }],
                      lastMessage: newMessage.message_text,
                      timestamp: newMessage.created_at,
                      unread: isOwnMessage ? c.unread : c.unread + 1
                    };
                  }
                  return c;
                }));
              }
            }
          );

          subscriptionsRef.current.set(chat.consultationId, subscription);
        });

      } catch (error) {
        console.error('Error loading chats from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChatsFromSupabase();

    // Cleanup subscriptions on unmount
    return () => {
      subscriptionsRef.current.forEach(subscription => {
        subscription.unsubscribe();
      });
      subscriptionsRef.current.clear();
    };
  }, []);

  const addChat = useCallback((chat: Chat) => {
    setChats((prev) => {
      const exists = prev.find((c) => c.id === chat.id);
      if (exists) {
        return prev.map((c) => (c.id === chat.id ? chat : c));
      }
      return [chat, ...prev];
    });
  }, []);

  const updateChat = useCallback((chatId: string, updates: Partial<Chat>) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, ...updates } : chat)),
    );
  }, []);

  const getTotalUnread = useCallback(() => {
    return chats.reduce((total, chat) => total + chat.unread, 0);
  }, [chats]);

  const markAsRead = useCallback((chatId: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, unread: 0 } : chat)),
    );
    
    // TODO: Update message status in Supabase to 'read'
  }, []);

  const sendMessage = useCallback(async (consultationId: string, messageText: string) => {
    if (!userId) return;

    try {
      await sendSupabaseMessage({
        consultation_id: consultationId,
        sender_id: userId,
        message_text: messageText,
        message_type: 'text',
        created_at: new Date().toISOString()
      });

      // Message will be added to chat via real-time subscription
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [userId]);

  const loadMessagesForConsultation = useCallback(async (consultationId: string) => {
    try {
      const messages = await getConsultationMessages(consultationId);
      
      setChats(prev => prev.map(chat => {
        if (chat.consultationId === consultationId) {
          return {
            ...chat,
            messages: messages.map((msg: any) => ({
              id: msg.id,
              sender: msg.sender_id === userId ? userType! : (userType === 'client' ? 'lawyer' : 'client'),
              text: msg.message_text,
              timestamp: msg.created_at,
              status: msg.status || 'sent'
            }))
          };
        }
        return chat;
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [userId, userType]);

  return (
    <MessagesContext.Provider
      value={{
        chats,
        loading,
        addChat,
        updateChat,
        getTotalUnread,
        markAsRead,
        sendMessage,
        loadMessagesForConsultation
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
}
