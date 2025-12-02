import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { TextInput } from '@/components/TextInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { theme } from '@/constants/theme';
import TicketChatScreen from '@/screens/TicketChatScreen';
import { useSupportStore } from '@/store/supportStore';
import { SupportTicket, TicketCategory } from '@/types/support';
import { validateRequired } from '@/utils/validation';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

const SupportScreen = () => {
  const {
    tickets,
    isLoading,
    fetchTickets,
    createTicket,
    isCreating,
    categories
  } = useSupportStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'technical' as TicketCategory,
  });
  const [validationErrors, setValidationErrors] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleTicketPress = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const handleBackFromChat = () => {
    setSelectedTicketId(null);
    // Refresh tickets when coming back from chat to show any updates
    handleRefresh();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTickets(1); // Reset to first page
    } catch (error) {
      console.error('Failed to refresh tickets:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: theme.colors.info },
    { value: 'medium', label: 'Medium', color: theme.colors.warning },
    { value: 'high', label: 'High', color: theme.colors.danger },
    { value: 'urgent', label: 'Urgent', color: '#FF0000' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return theme.colors.primary;
      case 'in-progress': return theme.colors.warning;
      case 'resolved': return theme.colors.success;
      case 'closed': return theme.colors.muted;
      default: return theme.colors.muted;
    }
  };

  const getPriorityColor = (priority: string) => {
    const option = priorityOptions.find(opt => opt.value === priority);
    return option?.color || theme.colors.muted;
  };

  const validateTicketForm = () => {
    const titleValidation = validateRequired(ticketForm.title, 'Ticket title');
    const descriptionValidation = validateRequired(ticketForm.description, 'Description');

    setValidationErrors({
      title: titleValidation.isValid ? '' : titleValidation.error || '',
      description: descriptionValidation.isValid ? '' : descriptionValidation.error || '',
    });

    return titleValidation.isValid && descriptionValidation.isValid;
  };

  const handleCreateTicket = async () => {
    if (!validateTicketForm()) {
      return;
    }

    try {
      await createTicket({
        title: ticketForm.title.trim(),
        description: ticketForm.description.trim(),
        priority: ticketForm.priority,
        category: ticketForm.category,
      });

      Alert.alert('Success', 'Your support ticket has been created successfully!');
      setShowCreateModal(false);
      setTicketForm({ title: '', description: '', priority: 'medium', category: 'technical' });
      setValidationErrors({ title: '', description: '' });
    } catch {
      Alert.alert('Error', 'Failed to create ticket. Please try again.');
    }
  };

  const openCreateModal = () => {
    setTicketForm({ title: '', description: '', priority: 'medium', category: 'technical' });
    setValidationErrors({ title: '', description: '' });
    setShowCreateModal(true);
  };

  const TicketCard = ({ ticket, isLast }: { ticket: SupportTicket; isLast: boolean }) => (
    <TouchableOpacity 
      style={[styles.ticketItem, !isLast && styles.ticketItemBorder]}
      onPress={() => handleTicketPress(ticket.ticket_id)}
      activeOpacity={0.6}
    >
      <View style={styles.ticketContent}>
        <View style={styles.ticketMain}>
          <ThemedText style={styles.ticketTitle}>
            {ticket.title}
          </ThemedText>
          <View style={styles.ticketMeta}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(ticket.status) }]} />
            <ThemedText style={styles.ticketStatus}>
              {ticket.status.replace('-', ' ')}
            </ThemedText>
          </View>
        </View>
        <View style={styles.ticketArrow}>
          <ThemedText style={styles.arrowText}>›</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const CategorySelector = () => (
    <View style={styles.priorityContainer}>
      <ThemedText variant="subtitle" style={styles.priorityLabel}>
        Category
      </ThemedText>
      <View style={styles.priorityOptions}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.priorityOption,
              ticketForm.category === category.value && styles.priorityOptionSelected,
              { borderColor: theme.colors.primary }
            ]}
            onPress={() => setTicketForm(prev => ({ ...prev, category: category.value }))}
          >
            <ThemedText style={[
              styles.priorityOptionText,
              ticketForm.category === category.value && { color: theme.colors.primary }
            ]}>
              {category.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const PrioritySelector = () => (
    <View style={styles.priorityContainer}>
      <ThemedText variant="subtitle" style={styles.priorityLabel}>
        Priority Level
      </ThemedText>
      <View style={styles.priorityOptions}>
        {priorityOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.priorityOption,
              ticketForm.priority === option.value && styles.priorityOptionSelected,
              { borderColor: option.color }
            ]}
            onPress={() => setTicketForm(prev => ({ ...prev, priority: option.value as any }))}
          >
            <ThemedText style={[
              styles.priorityOptionText,
              ticketForm.priority === option.value && { color: option.color }
            ]}>
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (selectedTicketId) {
    return (
      <TicketChatScreen
        ticketId={selectedTicketId}
        onBack={handleBackFromChat}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      <Header title="Support & Help" subtitle="Get assistance from our support team" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Help Section */}
        <View style={styles.helpSection}>
          <View style={styles.helpHeader}>
            <View style={styles.helpIconContainer}>
              <View style={styles.helpIcon}>
                <ThemedText style={styles.helpIconText}>?</ThemedText>
              </View>
            </View>
            <View style={styles.helpContent}>
              <ThemedText style={styles.helpTitle}>
                Need Assistance?
              </ThemedText>
              <ThemedText style={styles.helpDescription}>
                Get help from our support team within 24 hours
              </ThemedText>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.createTicketButton}
            onPress={openCreateModal}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.createTicketButtonText}>
              Create Ticket
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tickets */}
        <View style={styles.ticketsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Recent Tickets
            </ThemedText>
            {tickets.length > 0 && (
              <ThemedText style={styles.ticketCount}>
                {tickets.length}
              </ThemedText>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <ThemedText style={styles.loadingText}>
                Loading tickets...
              </ThemedText>
            </View>
          ) : tickets.length === 0 ? (
            <View style={styles.emptyTickets}>
              <View style={styles.emptyIcon}>
                <ThemedText style={styles.emptyIconText}>📝</ThemedText>
              </View>
              <ThemedText style={styles.emptyTitle}>
                No tickets yet
              </ThemedText>
              <ThemedText style={styles.emptyDescription}>
                Your support tickets will appear here
              </ThemedText>
            </View>
          ) : (
            <View style={styles.ticketsList}>
              {tickets.map((ticket, index) => (
                <TicketCard key={ticket.ticket_id} ticket={ticket} isLast={index === tickets.length - 1} />
              ))}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Create Ticket Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <ThemedText variant="title" style={styles.modalTitle}>
                Create Support Ticket
              </ThemedText>

              <TextInput
                label="Ticket Title"
                placeholder="Brief description of your issue"
                value={ticketForm.title}
                onChangeText={(text) => setTicketForm(prev => ({ ...prev, title: text }))}
                error={validationErrors.title}
              />

              <TextInput
                label="Detailed Description"
                placeholder="Please provide detailed information about your issue..."
                value={ticketForm.description}
                onChangeText={(text) => setTicketForm(prev => ({ ...prev, description: text }))}
                error={validationErrors.description}
                style={styles.textArea}
              />

              <CategorySelector />
              <PrioritySelector />

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowCreateModal(false)}
                  variant="outline"
                  size="large"
                  style={styles.modalButton}
                />
                <Button
                  title={isCreating ? "Creating..." : "Create Ticket"}
                  onPress={handleCreateTicket}
                  variant="primary"
                  size="large"
                  disabled={isCreating}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  
  // Premium Help Section
  helpSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  helpIconContainer: {
    marginRight: 16,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  createTicketButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  createTicketButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  categoriesCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    ...theme.shadows.small,
  },
  categoriesTitle: {
    color: theme.colors.dark,
    marginBottom: theme.spacing.l,
  },
  categoryItem: {
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryTitle: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  categoryDescription: {
    color: theme.colors.textSecondary,
  },
  // Tickets Section
  ticketsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
  },
  ticketCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Tickets List Container
  ticketsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  
  // Individual Ticket Item
  ticketItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  ticketItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ticketContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketMain: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 6,
    lineHeight: 20,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  ticketStatus: {
    fontSize: 13,
    color: '#64748B',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  ticketArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 18,
    color: '#CBD5E1',
    fontWeight: '300',
  },
  contactCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    ...theme.shadows.small,
  },
  contactTitle: {
    color: theme.colors.dark,
    marginBottom: theme.spacing.l,
  },
  contactText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
  },
  // Empty & Loading States
  emptyTickets: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    marginTop: '10%',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    flexGrow: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1E293B',
    marginBottom: 28,
    letterSpacing: -0.2,
  },
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
  },
  priorityContainer: {
    marginVertical: 20,
  },
  priorityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  priorityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  priorityOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderColor: '#E2E8F0',
  },
  priorityOptionSelected: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
  },
  priorityOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  supportNote: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 12,
  },
});

export default SupportScreen;