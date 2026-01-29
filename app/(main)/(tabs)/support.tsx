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
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { log } from '@/utils/logger';

const SupportScreen = () => {
  const {
    tickets,
    isLoading,
    fetchTickets,
    createTicket,
    isCreating,
    categories,
    priorities
  } = useSupportStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    priority: 'low' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'general' as TicketCategory,
  });
  const [validationErrors, setValidationErrors] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchTickets();
  }, []); // fetchTickets is stable

  const handleTicketPress = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const handleBackFromChat = () => {
    setSelectedTicketId(null);
    // Refresh tickets when coming back from chat to show any updates
    handleRefresh();
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchTickets(1); // Reset to first page
    } catch (error) {
      log.error('Failed to refresh tickets', error);
    } finally {
      setRefreshing(false);
    }
  }, []); // fetchTickets is stable


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
    const option = priorities.find(opt => opt.value === priority);
    return option?.color || theme.colors.muted;
  };

  const validateTicketForm = () => {
    // API requires title to be at least 5 characters
    const titleValidation = validateRequired(ticketForm.title, 'Ticket title', 5);
    // API requires description to be at least 10 characters (reasonable assumption)
    const descriptionValidation = validateRequired(ticketForm.description, 'Description', 10);

    const errors = {
      title: titleValidation.isValid ? '' : titleValidation.error || '',
      description: descriptionValidation.isValid ? '' : descriptionValidation.error || '',
    };

    setValidationErrors(errors);
    return titleValidation.isValid && descriptionValidation.isValid;
  };

  const handleCreateTicket = async () => {
    if (!validateTicketForm()) {
      return;
    }

    const ticketData = {
      title: ticketForm.title.trim(),
      description: ticketForm.description.trim(),
      priority: ticketForm.priority,
      category: ticketForm.category,
    };

    try {
      await createTicket(ticketData);
      Alert.alert('Success', 'Your support ticket has been created successfully!');
      setShowCreateModal(false);
      setTicketForm({ title: '', description: '', priority: 'low', category: 'general' });
      setValidationErrors({ title: '', description: '' });
    } catch (error) {
      // Try to parse API error for better user feedback
      let errorMessage = 'Failed to create ticket. Please try again.';
      
      if (error?.message) {
        try {
          const apiError = JSON.parse(error.message);
          if (apiError.detail) {
            errorMessage = apiError.detail;
          }
        } catch (parseError) {
          // If not JSON, use the message as is
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const openCreateModal = () => {
    setTicketForm({ title: '', description: '', priority: 'low', category: 'general' });
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
    <View style={styles.selectorContainer}>
      <ThemedText variant="subtitle" style={styles.selectorLabel}>
        Category
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
        <View style={styles.selectorOptions}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.value}
              style={[
                styles.selectorOption,
                ticketForm.category === category.value && styles.selectorOptionSelected,
              ]}
              onPress={() => setTicketForm(prev => ({ ...prev, category: category.value }))}
            >
              <ThemedText style={[
                styles.selectorOptionText,
                ticketForm.category === category.value && styles.selectorOptionTextSelected
              ]}>
                {category.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const PrioritySelector = () => (
    <View style={styles.selectorContainer}>
      <ThemedText variant="subtitle" style={styles.selectorLabel}>
        Priority
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
        <View style={styles.selectorOptions}>
          {priorities.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.selectorOption,
                ticketForm.priority === option.value && styles.selectorOptionSelected,
              ]}
              onPress={() => setTicketForm(prev => ({ ...prev, priority: option.value as any }))}
            >
              <ThemedText style={[
                styles.selectorOptionText,
                ticketForm.priority === option.value && styles.selectorOptionTextSelected
              ]}>
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText variant="title" style={styles.modalTitle}>
                  New Ticket
                </ThemedText>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setShowCreateModal(false)}
                >
                  <ThemedText style={styles.closeButtonText}>×</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.warningBox}>
                <ThemedText style={styles.warningBoxText}>
                  All requests will be handled by university administration.
                </ThemedText>
              </View>

              <TextInput
                label="Title"
                placeholder="Brief description of your issue"
                value={ticketForm.title}
                onChangeText={(text) => setTicketForm(prev => ({ ...prev, title: text }))}
                error={validationErrors.title}
              />

              <View style={styles.inputSpacer} />

              <TextInput
                label="Description"
                placeholder="Provide details about your issue..."
                value={ticketForm.description}
                onChangeText={(text) => setTicketForm(prev => ({ ...prev, description: text }))}
                error={validationErrors.description}
                style={styles.descriptionInput}
                multiline={true}
                numberOfLines={2}
              />

              <CategorySelector />
              <PrioritySelector />

              <Button
                title={isCreating ? "Submitting..." : "Submit"}
                onPress={handleCreateTicket}
                variant="primary"
                size="medium"
                disabled={isCreating}
                style={styles.submitButton}
              />
            </View>
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: -4,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#94A3B8',
    fontWeight: '300',
    lineHeight: 24,
  },
  descriptionInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  inputSpacer: {
    height: 8,
  },
  
  // Selector styles (Category & Priority)
  selectorContainer: {
    marginTop: 16,
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
  },
  selectorScroll: {
    marginHorizontal: -4,
  },
  selectorOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  selectorOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    borderColor: '#E2E8F0',
  },
  selectorOptionSelected: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  selectorOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  selectorOptionTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 10,
  },
  warningBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  warningBoxText: {
    fontSize: 12,
    color: '#C2410C',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 12,
  },
});

export default SupportScreen;