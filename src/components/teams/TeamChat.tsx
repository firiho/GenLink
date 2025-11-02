import { useState, useEffect, useRef, useMemo } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, Timestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface TeamChatProps {
  teamId: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  timestamp: Date;
  createdAt: Timestamp;
}

interface UserProfileCache {
  [userId: string]: {
    name: string;
    photo: string;
  };
}

export default function TeamChat({ teamId }: TeamChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const userProfilesRef = useRef<UserProfileCache>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user profile with caching
  const fetchUserProfile = async (userId: string): Promise<{ name: string; photo: string }> => {
    // Check cache first
    if (userProfilesRef.current[userId]) {
      return userProfilesRef.current[userId];
    }
    let userName = 'Unknown User';
    let userPhoto = '/placeholder-user.svg';

    try {
      // Try profiles collection first
      const profileDoc = await getDoc(doc(db, 'profiles', userId));
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        userName = profileData.name || 
                  profileData.displayName || 
                  `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 
                  profileData.username || 
                  'Unknown User';
        userPhoto = profileData.photo || profileData.avatar || '/placeholder-user.svg';
      } else {
        // Fallback to user collection
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userName = userData.name || 
                    userData.displayName || 
                    `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 
                    userData.username || 
                    'Unknown User';
          userPhoto = userData.photo || userData.avatar || '/placeholder-user.svg';
        }
      }
    } catch (error) {
      console.warn('Could not fetch user profile:', error);
    }

    const profile = { name: userName, photo: userPhoto };
    
    // Update cache
    userProfilesRef.current[userId] = profile;
    
    return profile;
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 50);
      });
    }
  }, [messages.length]);

  // Set up real-time listener for messages
  useEffect(() => {
    if (!teamId) return;

    setLoading(true);
    const messagesRef = collection(db, 'teams', teamId, 'messages');
    const messagesQuery = query(
      messagesRef,
      orderBy('createdAt', 'asc'),
      limit(100) // Last 100 messages
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      async (snapshot) => {
        // Get unique user IDs
        const userIds = new Set<string>();
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.userId) userIds.add(data.userId);
        });

        // Fetch all user profiles in parallel (only for new users not in cache)
        const missingUserIds = Array.from(userIds).filter(userId => !userProfilesRef.current[userId]);
        const profilePromises = missingUserIds.map(userId => 
          fetchUserProfile(userId).then(profile => ({ userId, profile }))
        );
        
        await Promise.all(profilePromises);

        // Build messages with cached profiles
        const messagesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          const profile = userProfilesRef.current[data.userId] || { name: 'Unknown User', photo: '/placeholder-user.svg' };

          return {
            id: doc.id,
            userId: data.userId,
            userName: profile.name,
            userPhoto: profile.photo,
            text: data.text,
            timestamp: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            createdAt: data.createdAt
          } as Message;
        });

        setMessages(messagesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to messages:', error);
        toast.error('Failed to load messages');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [teamId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !messageText.trim()) return;

    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const messagesRef = collection(db, 'teams', teamId, 'messages');
      await addDoc(messagesRef, {
        userId: user.uid,
        teamId: teamId,
        text: text,
        createdAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
      setMessageText(text); // Restore message text on error
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();
    if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: Array<{ date: string; messages: Message[] }> = [];
    let currentGroup: { date: string; messages: Message[] } | null = null;

    messages.forEach((message) => {
      const messageDate = message.timestamp.toDateString();
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { date: messageDate, messages: [message] };
      } else {
        currentGroup.messages.push(message);
      }
    });

    if (currentGroup) groups.push(currentGroup);
    return groups;
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-col h-[600px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-3/4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] sm:h-[700px] bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-sm">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Team Chat</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-4 min-h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-center">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date} className="space-y-3">
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {group.date === new Date().toDateString() 
                        ? 'Today' 
                        : group.date === new Date(Date.now() - 86400000).toDateString()
                        ? 'Yesterday'
                        : new Date(group.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric',
                            year: new Date(group.date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                          })
                      }
                    </span>
                  </div>
                </div>

                {/* Messages in group */}
                {group.messages.map((message, index) => {
                  const isOwnMessage = message.userId === user?.uid;
                  const prevMessage = index > 0 ? group.messages[index - 1] : null;
                  const nextMessage = index < group.messages.length - 1 ? group.messages[index + 1] : null;
                  
                  const showAvatar = !prevMessage || prevMessage.userId !== message.userId;
                  const showTime = !nextMessage || 
                                  nextMessage.userId !== message.userId ||
                                  (nextMessage.timestamp.getTime() - message.timestamp.getTime()) > 300000; // 5 minutes

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${
                        !showAvatar ? 'mt-0.5' : 'mt-2'
                      }`}
                    >
                      {/* Avatar */}
                      {showAvatar ? (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={message.userPhoto} alt={message.userName} />
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs">
                            {message.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8" />
                      )}

                      {/* Message Bubble */}
                      <div className={`flex flex-col max-w-[70%] sm:max-w-[60%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        {showAvatar && (
                          <span className={`text-xs font-medium mb-1 px-1 ${
                            isOwnMessage 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {isOwnMessage ? 'You' : message.userName}
                          </span>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 shadow-sm ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
                        </div>
                        {showTime && (
                          <span className={`text-xs mt-1 px-1 ${
                            isOwnMessage
                              ? 'text-blue-600/70 dark:text-blue-400/70'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {formatMessageTime(message.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 pr-12 resize-none min-h-[44px]"
              disabled={sending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            disabled={!messageText.trim() || sending}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 text-white h-[44px] w-[44px] flex-shrink-0 disabled:opacity-50"
          >
            {sending ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

