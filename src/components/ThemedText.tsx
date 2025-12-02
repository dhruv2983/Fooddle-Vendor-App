import React from 'react';
import { Text, TextProps } from 'react-native';
import { theme } from '@/constants/theme';

type ThemedTextProps = TextProps & {
  variant?: keyof typeof theme.textVariants;
};

export const ThemedText: React.FC<ThemedTextProps> = ({ style, variant = 'body', ...props }) => {
  return (
    <Text
      style={[
        { color: theme.colors.text },
        theme.textVariants[variant],
        style,
      ]}
      {...props}
    />
  );
};
