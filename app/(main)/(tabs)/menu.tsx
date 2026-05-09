import React from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { theme } from '@/constants/theme';
import Menu from '@/components/shop/Menu';
import { Header } from '@/components/Header';

const MenuScreen = () => {
  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      <Header title="Menu" subtitle="Manage your menu items" />

      <View style={styles.content}>
        <Menu />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  content: {
    flex: 1,
  },
});

export default MenuScreen;
