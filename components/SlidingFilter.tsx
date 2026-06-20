import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { M3Pressable } from './M3Pressable';

interface FilterOption {
  id: string;
  label: string;
  value: 'all' | 'in-progress' | 'weakest' | 'revision-due';
}

interface SlidingFilterProps {
  options: FilterOption[];
  onFilterChange: (filter: FilterOption['value']) => void;
  defaultFilter?: FilterOption['value'];
}

export const SlidingFilter = ({
  options,
  onFilterChange,
  defaultFilter = 'all'
}: SlidingFilterProps) => {
  const [activeFilter, setActiveFilter] = useState(defaultFilter);

  const handleFilterPress = (filter: FilterOption['value']) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => {
          const isActive = activeFilter === option.value;
          return (
            <M3Pressable
              key={option.id}
              style={[
                styles.filterButton,
                isActive && styles.activeFilterButton
              ]}
              onPress={() => handleFilterPress(option.value)}
            >
              <Text style={[
                styles.filterText,
                isActive && styles.activeFilterText
              ]}>
                {option.label}
              </Text>
            </M3Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8, // Material 3 standard chip rounding
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterButton: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  activeFilterText: {
    color: Colors.onPrimaryContainer,
    fontWeight: '600',
  },
});

