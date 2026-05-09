import React from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { theme } from '@/constants/theme';
import Stats from '@/components/shop/Stats';
import { Header } from '@/components/Header';

const AnalyticsScreen = () => {
  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      <Header title="Analytics" subtitle="Track your shop performance" />

      <View style={styles.content}>
        <Stats />
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

export default AnalyticsScreen;
