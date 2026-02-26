import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { useMenuStore } from '@/store/menuStore';
import { MenuItem as MenuItemType, UpdateMenuItemRequest } from '@/types/menu';
import { theme } from '@/constants/theme';
import { validateRequired, validatePrice } from '@/utils/validation';
import { formatPrice } from '@/utils/priceHelpers';

interface MenuItemEditScreenProps {
  item: MenuItemType;
  onBack: () => void;
  onSuccess: () => void;
}

const MenuItemEditScreen: React.FC<MenuItemEditScreenProps> = ({ item, onBack, onSuccess }) => {
  const { updateMenuItem, isLoading, error } = useMenuStore();
  
  // Form state
  const [formData, setFormData] = useState({
    name: item.name || '',
    price: formatPrice(item.price).toString(),
    mrp: item.mrp ? formatPrice(item.mrp).toString() : '',
    visible: item.visible || false,
  });
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form field
  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    const nameValidation = validateRequired(formData.name, 'Item name');
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error || 'Name is required';
    }

    // Validate price
    const priceValidation = validatePrice(formData.price);
    if (!priceValidation.isValid) {
      newErrors.price = priceValidation.error || 'Invalid price';
    }

    // Validate MRP (optional)
    if (formData.mrp) {
      const mrpValidation = validatePrice(formData.mrp);
      if (!mrpValidation.isValid) {
        newErrors.mrp = mrpValidation.error || 'Invalid MRP';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updateData: UpdateMenuItemRequest = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        visible: formData.visible,
      };

      // Add MRP if provided
      if (formData.mrp) {
        updateData.mrp = parseFloat(formData.mrp);
      }

      await updateMenuItem(item.id.toString(), updateData);

      onSuccess();
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update menu item. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ThemedText style={styles.backText}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Edit Menu Item</ThemedText>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Current Item Info */}
          <View style={styles.currentInfo}>
            <View style={styles.currentItemCard}>
              <ThemedText variant="title">{item.name}</ThemedText>
              {item.category_name && (
                <ThemedText variant="caption" style={styles.currentCategory}>
                  Category: {item.category_name}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Edit Form */}
          <View style={styles.editSection}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Edit Information
            </ThemedText>

            {/* Item Name */}
            <TextInput
              label="Item Name"
              placeholder="Enter item name"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              error={errors.name}
              style={styles.input}
            />

            {/* Price Row - Read Only */}
            <View style={styles.priceRow}>
              <View style={styles.priceField}>
                <TextInput
                  label="Selling Price (₹)"
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(value) => updateField('price', value)}
                  keyboardType="decimal-pad"
                  error={errors.price}
                  editable={false}
                  style={styles.readOnlyInput}
                />
              </View>
              
              <View style={styles.priceField}>
                <TextInput
                  label="MRP (₹)"
                  placeholder="0.00 (Optional)"
                  value={formData.mrp}
                  onChangeText={(value) => updateField('mrp', value)}
                  keyboardType="decimal-pad"
                  error={errors.mrp}
                  editable={false}
                  style={styles.readOnlyInput}
                />
              </View>
            </View>

            {/* Visibility Toggle */}
            <View style={styles.visibilitySection}>
              <View style={styles.visibilityRow}>
                <View style={styles.visibilityTextContainer}>
                  <ThemedText style={styles.visibilityLabel}>Item Visibility</ThemedText>
                  <ThemedText style={[styles.visibilityStatus, formData.visible ? styles.visibleStatus : styles.hiddenStatus]}>
                    {formData.visible ? 'Visible to customers' : 'Hidden from customers'}
                  </ThemedText>
                </View>
                <Switch
                  value={formData.visible}
                  onValueChange={(value) => updateField('visible', value)}
                  trackColor={{ false: '#F5F5F5', true: '#E8F5E8' }}
                  thumbColor={formData.visible ? '#4CAF50' : '#9E9E9E'}
                  ios_backgroundColor="#F5F5F5"
                />
              </View>
            </View>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Cancel"
          onPress={onBack}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title={isLoading ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          disabled={isLoading}
          variant="primary"
          style={styles.saveButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    paddingTop: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF7',
  },
  backButton: {
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.xs,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5A8BC7',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D5A87',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 60, // Same width as back button to center title
  },
  content: {
    flex: 1,
  },
  form: {
    padding: theme.spacing.m,
  },
  currentInfo: {
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    marginBottom: theme.spacing.m,
    color: theme.colors.dark,
    fontWeight: '600',
  },
  currentItemCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.s,
    marginBottom: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderColor: theme.colors.border,
  },
  currentPrice: {
    color: theme.colors.success,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
  },
  currentCategory: {
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  editSection: {
    marginBottom: theme.spacing.l,
  },
  input: {
    marginBottom: theme.spacing.m,
  },
  priceRow: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  priceField: {
    flex: 1,
  },
  visibilitySection: {
    marginTop: theme.spacing.xs,
  },
  visibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visibilityTextContainer: {
    flex: 1,
  },
  visibilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5A87',
    marginBottom: theme.spacing.xs,
  },
  visibilityStatus: {
    fontSize: 13,
    fontWeight: '500',
  },
  visibleStatus: {
    color: '#4CAF50',
  },
  hiddenStatus: {
    color: '#9E9E9E',
  },
  errorContainer: {
    backgroundColor: '#FFE6E6',
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: '#FFB8B8',
  },
  errorText: {
    color: '#D73A49',
    textAlign: 'center',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: '#E8EEF7',
    gap: theme.spacing.m,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  readOnlyInput: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
});

export default MenuItemEditScreen;