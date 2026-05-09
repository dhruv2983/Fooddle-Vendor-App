import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { useMenuStore } from '@/store/menuStore';
import { MenuItem as MenuItemType, MenuVariant, UpdateVariantRequest } from '@/types/menu';
import { theme } from '@/constants/theme';
import { validateRequired, validatePrice } from '@/utils/validation';

interface MenuItemEditScreenProps {
  item: MenuItemType;
  variant: MenuVariant;
  onBack: () => void;
  onSuccess: () => void;
}

const MenuItemEditScreen: React.FC<MenuItemEditScreenProps> = ({ item, variant, onBack, onSuccess }) => {
  const { updateVariant, isLoading, error } = useMenuStore();

  const [name, setName] = useState(variant.name);
  const [price, setPrice] = useState(variant.price);
  const [mrp, setMrp] = useState(variant.mrp || '');
  const [showMRP, setShowMRP] = useState(variant.showMRP ?? false);
  const [isAvailable, setIsAvailable] = useState(variant.is_available ?? true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validateRequired(name, 'Variant name');
    if (!nameCheck.isValid) newErrors.name = nameCheck.error || 'Required';

    const priceCheck = validatePrice(price);
    if (!priceCheck.isValid) newErrors.price = priceCheck.error || 'Invalid price';

    if (mrp) {
      const mrpCheck = validatePrice(mrp);
      if (!mrpCheck.isValid) newErrors.mrp = mrpCheck.error || 'Invalid MRP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const data: UpdateVariantRequest = {
        name: name.trim(),
        price: parseFloat(price),
        is_available: isAvailable,
        showMRP,
      };
      if (mrp) data.mrp = parseFloat(mrp);

      await updateVariant(item.id.toString(), variant.id.toString(), data);
      onSuccess();
    } catch {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ThemedText style={styles.backText}>← Back</ThemedText>
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>{item.name}</ThemedText>
          <ThemedText style={styles.headerSub} numberOfLines={1}>{variant.name}</ThemedText>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <TextInput
            label="Variant Name"
            placeholder="e.g. Regular, Large, 500ml"
            value={name}
            onChangeText={text => { setName(text); clearError('name'); }}
            error={errors.name}
          />

          <View style={styles.priceRow}>
            <View style={styles.priceField}>
              <TextInput
                label="Selling Price (₹)"
                placeholder="0.00"
                value={price}
                onChangeText={text => { setPrice(text); clearError('price'); }}
                keyboardType="decimal-pad"
                error={errors.price}
              />
            </View>
            <View style={styles.priceField}>
              <TextInput
                label="MRP (₹)"
                placeholder="Optional"
                value={mrp}
                onChangeText={text => { setMrp(text); clearError('mrp'); }}
                keyboardType="decimal-pad"
                error={errors.mrp}
              />
            </View>
          </View>

          <View style={styles.visibilityRow}>
            <View>
              <ThemedText style={styles.visibilityLabel}>Available for ordering</ThemedText>
              <ThemedText style={[styles.visibilityStatus, isAvailable ? styles.statusOn : styles.statusOff]}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </ThemedText>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#F5F5F5', true: '#E8F5E8' }}
              thumbColor={isAvailable ? '#4CAF50' : '#9E9E9E'}
              ios_backgroundColor="#F5F5F5"
            />
          </View>

          <View style={styles.visibilityRow}>
            <View>
              <ThemedText style={styles.visibilityLabel}>Show MRP</ThemedText>
              <ThemedText style={[styles.visibilityStatus, showMRP ? styles.statusOn : styles.statusOff]}>
                {showMRP ? 'MRP displayed' : 'MRP hidden'}
              </ThemedText>
            </View>
            <Switch
              value={showMRP}
              onValueChange={setShowMRP}
              trackColor={{ false: '#F5F5F5', true: '#E8F5E8' }}
              thumbColor={showMRP ? '#4CAF50' : '#9E9E9E'}
              ios_backgroundColor="#F5F5F5"
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.actionButtons}>
        <Button title="Cancel" onPress={onBack} variant="outline" style={styles.cancelButton} />
        <Button
          title={isLoading ? 'Saving...' : 'Save Changes'}
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
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    paddingTop: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF7',
  },
  backButton: {
    paddingVertical: theme.spacing.s,
    paddingRight: theme.spacing.m,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5A8BC7',
  },
  headerTitles: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D5A87',
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 1,
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: theme.spacing.m,
    paddingTop: theme.spacing.l,
  },
  priceRow: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  priceField: {
    flex: 1,
  },
  visibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.l,
  },
  visibilityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5A87',
  },
  visibilityStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  statusOn: { color: '#4CAF50' },
  statusOff: { color: '#9E9E9E' },
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
  cancelButton: { flex: 1 },
  saveButton: { flex: 2 },
});

export default MenuItemEditScreen;
