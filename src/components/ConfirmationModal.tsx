import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onCancel} />
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText variant="title" style={styles.modalTitle}>
              {title}
            </ThemedText>
            
            <ThemedText variant="body" style={styles.modalMessage}>
              {message}
            </ThemedText>
            
            <View style={styles.buttonContainer}>
              <Button
                title={cancelText}
                onPress={onCancel}
                variant="outline"
                size="medium"
                style={styles.cancelButton}
              />
              <Button
                title={confirmText}
                onPress={onConfirm}
                variant={confirmVariant}
                size="medium"
                style={styles.confirmButton}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.xl,
    ...theme.shadows.large,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    color: theme.colors.dark,
  },
  modalMessage: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});