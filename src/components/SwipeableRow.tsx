import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
  label?: string;
};

export default function SwipeableRow({ children, onDelete, label = 'Hapus' }: Props) {
  const { brand } = useTheme();
  const ref = useRef<Swipeable>(null);

  const renderRight = (progress: Animated.AnimatedInterpolation<number>) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
      extrapolate: 'clamp',
    });
    return (
      <View style={styles.rightWrap}>
        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: brand.danger }]}
          onPress={() => {
            ref.current?.close();
            onDelete();
          }}
        >
          <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>
            🗑️ {label}
          </Animated.Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable ref={ref} renderRightActions={renderRight} overshootRight={false}>
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  rightWrap: { justifyContent: 'center', marginBottom: 10 },
  deleteBtn: {
    width: 90,
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
});