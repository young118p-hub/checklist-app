import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SituationTemplate } from '../types';

interface SmartRecommendationCardProps {
  template: SituationTemplate;
  isSelected: boolean;
  onPress: () => void;
}

export const SmartRecommendationCard: React.FC<SmartRecommendationCardProps> = ({
  template,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.selectedCard
      ]}
      onPress={onPress}
    >
      <Text style={styles.fireIcon}>🔥</Text>
      <Text style={styles.templateName}>{template.name}</Text>
      <Text style={styles.itemCount}>{template.items.length}개</Text>
      {template.description && (
        <Text style={styles.description}>{template.description}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#dc2626',
    borderWidth: 2,
    backgroundColor: '#fef2f2',
  },
  fireIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  templateName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#333',
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
});