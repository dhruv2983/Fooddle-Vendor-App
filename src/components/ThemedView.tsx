import React from 'react';
import { View, ViewProps } from 'react-native';
import { theme } from '@/constants/theme';

export const ThemedView: React.FC<ViewProps> = ({ style, ...props }) => {
  return (
    <View
      style={[
        { backgroundColor: theme.colors.background },
        style,
      ]}
      {...props}
    />
  );
};
