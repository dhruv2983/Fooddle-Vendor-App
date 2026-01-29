import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput as RNTextInput,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { SupportTicket, SupportMessage } from '@/types/support';
import { useSupportStore } from '@/store/supportStore';

interface TicketChatScreenProps {
  ticketId: string;
  onBack: () => void;
}

const TicketChatScreen: React.FC<TicketChatScreenProps> = ({ ticketId, onBack }) => {
  const { getTicketById, sendMessageToTicket } = useSupportStore();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let cancelled = false;
    
    const loadData = async () => {
      if (!cancelled) {
        await loadTicketDetails();
      }
    };
    
    loadData();
    
    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      const ticketData = await getTicketById(ticketId);
      setTicket(ticketData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load ticket details');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'urgent': return '#DC2626';
      default: return theme.colors.primary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#3B82F6';
      case 'in-progress': return '#F59E0B';
      case 'resolved': return '#10B981';
      case 'closed': return '#6B7280';
      default: return theme.colors.primary;
    }
  };

  const MessageBubble = ({ message }: { message: SupportMessage }) => (
    <View style={[
      styles.messageBubble,
      message.is_admin_response ? styles.adminMessage : styles.userMessage
    ]}>
      <View style={styles.messageHeader}>
        <ThemedText variant="caption" style={styles.senderName}>
          {message.sender_name}
        </ThemedText>
        <ThemedText variant="caption" style={styles.messageTime}>
          {formatDate(message.created_at)}
        </ThemedText>
      </View>
      <ThemedText variant="body" style={styles.messageText}>
        {message.message}
      </ThemedText>
    </View>
  );

  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;
    
    const messageToSend = newMessage.trim();
    setSendingMessage(true);
    setNewMessage(''); // Clear input immediately for better UX
    
    try {
      await sendMessageToTicket(ticketId, messageToSend);
      // Reload ticket details to get new messages
      await loadTicketDetails();
    } catch (error) {
      // Restore message on error
      setNewMessage(messageToSend);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Header title="Loading..." onBack={onBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText variant="body" style={styles.loadingText}>
            Loading ticket details...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!ticket) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Header title="Error" onBack={onBack} />
        <View style={styles.errorContainer}>
          <ThemedText variant="body">Failed to load ticket</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Custom Header with Back Button */}
      <View style={[styles.customHeader, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.dark} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <ThemedText variant="title" style={styles.headerTitle}>
            Ticket {ticket.ticket_id}
          </ThemedText>
        </View>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Ticket Details */}
        <View style={styles.ticketDetails}>
          <ThemedText variant="title" style={styles.ticketTitle}>
            {ticket.title}
          </ThemedText>
          
          <View style={styles.ticketMeta}>
            <View style={styles.metaRow}>
              <ThemedText variant="subtitle" style={styles.metaLabel}>Status:</ThemedText>
              <ThemedText variant="subtitle" style={[styles.metaValue, { color: getStatusColor(ticket.status) }]}>
                {ticket.status.replace('-', ' ')}
              </ThemedText>
            </View>
            
            <View style={styles.metaRow}>
              <ThemedText variant="subtitle" style={styles.metaLabel}>Priority:</ThemedText>
              <ThemedText variant="subtitle" style={[styles.metaValue, { color: getPriorityColor(ticket.priority) }]}>
                {ticket.priority}
              </ThemedText>
            </View>
            
            <View style={styles.metaRow}>
              <ThemedText variant="subtitle" style={styles.metaLabel}>Category:</ThemedText>
              <ThemedText variant="subtitle" style={styles.metaValue}>
                {ticket.category}
              </ThemedText>
            </View>
          </View>

          <ThemedText variant="body" style={styles.ticketDescription}>
            {ticket.description}
          </ThemedText>
        </View>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {ticket.messages?.map((message) => (
            <MessageBubble key={message.message_id} message={message} />
          ))}
        </ScrollView>

        {/* Message Input - Only show if ticket is not closed */}
        {ticket.status !== 'closed' && (
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <RNTextInput
                placeholder="Type your message..."
                value={newMessage}
                onChangeText={setNewMessage}
                style={styles.messageInput}
                multiline
                maxLength={500}
                placeholderTextColor={theme.colors.muted}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: newMessage.trim() ? theme.colors.primary : '#E5E7EB' }
                ]}
                onPress={sendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="arrow-up" 
                  size={20} 
                  color={newMessage.trim() ? theme.colors.white : '#9CA3AF'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    padding: theme.spacing.s,
    marginRight: theme.spacing.m,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.dark,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.m,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  ticketDetails: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  ticketTitle: {
    color: theme.colors.dark,
    marginBottom: theme.spacing.m,
  },
  ticketMeta: {
    marginBottom: theme.spacing.m,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  metaLabel: {
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  metaValue: {
    color: theme.colors.dark,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ticketDescription: {
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  messagesContainer: {
    flex: 1,
    padding: theme.spacing.l,
  },
  messageBubble: {
    marginBottom: theme.spacing.m,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#E3F2FD',
    alignSelf: 'flex-end',
    borderBottomRightRadius: theme.borderRadius.s,
  },
  adminMessage: {
    backgroundColor: '#F3E5F5',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: theme.borderRadius.s,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  senderName: {
    fontWeight: '600',
    color: theme.colors.dark,
  },
  messageTime: {
    color: theme.colors.muted,
  },
  messageText: {
    color: theme.colors.dark,
    lineHeight: 18,
  },
  inputContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    position: 'relative',
  },
  messageInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    color: theme.colors.text,
    maxHeight: 100,
    minHeight: 36,
    paddingRight: 44, // Space for send button
    paddingVertical: theme.spacing.s,
    textAlignVertical: 'top',
  },
  sendButton: {
    position: 'absolute',
    right: theme.spacing.s,
    bottom: theme.spacing.s,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default TicketChatScreen;