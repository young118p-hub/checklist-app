import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SituationTemplate, ChecklistItem } from '../types';
import { generateChecklistFromTemplate } from '../lib/templates';

interface ChecklistDetailScreenProps {
  navigation: any;
  route: {
    params: {
      templateId: string;
      peopleCount: number;
    };
  };
}

interface ChecklistItemWithQuantity extends ChecklistItem {
  quantity: number;
  completed: boolean;
}

export const ChecklistDetailScreen: React.FC<ChecklistDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { templateId, peopleCount } = route.params;
  const [checklist, setChecklist] = useState<ChecklistItemWithQuantity[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [editingItem, setEditingItem] = useState<ChecklistItemWithQuantity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadChecklist = async () => {
      try {
        const generatedChecklist = generateChecklistFromTemplate(templateId, peopleCount);
        
        const checklistWithStatus = generatedChecklist.items.map(item => ({
          ...item,
          completed: false,
        }));

        setChecklist(checklistWithStatus);
        setTemplateName(generatedChecklist.templateName);
        
        navigation.setOptions({
          title: `${generatedChecklist.templateName} 체크리스트`,
        });
      } catch (error) {
        console.error('체크리스트 로딩 실패:', error);
        Alert.alert('오류', '체크리스트를 불러올 수 없습니다.');
      }
    };

    loadChecklist();
  }, [templateId, peopleCount, navigation]);

  const toggleItemCompletion = (itemId: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  const addCustomItem = () => {
    setEditingItem({
      id: `custom-${Date.now()}`,
      title: '',
      description: '',
      category: 'custom',
      quantity: 1,
      completed: false,
    });
    setModalVisible(true);
  };

  const editItem = (item: ChecklistItemWithQuantity) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const saveItem = () => {
    if (!editingItem || !editingItem.title.trim()) {
      Alert.alert('알림', '항목 이름을 입력해주세요.');
      return;
    }

    if (checklist.some(item => item.id === editingItem.id)) {
      setChecklist(prev =>
        prev.map(item =>
          item.id === editingItem.id ? editingItem : item
        )
      );
    } else {
      setChecklist(prev => [...prev, editingItem]);
    }

    setModalVisible(false);
    setEditingItem(null);
  };

  const deleteItem = (itemId: string) => {
    Alert.alert(
      '삭제 확인',
      '이 항목을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setChecklist(prev => prev.filter(item => item.id !== itemId));
          },
        },
      ]
    );
  };

  const getCompletionProgress = () => {
    const completed = checklist.filter(item => item.completed).length;
    const total = checklist.length;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  const progress = getCompletionProgress();
  const categories = [...new Set(checklist.map(item => item.category))];

  return (
    <View style={styles.container}>
      {/* 진행률 표시 */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>진행률</Text>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${progress.percentage}%` }]} 
          />
        </View>
        <Text style={styles.progressText}>
          {progress.completed}/{progress.total} 완료 ({Math.round(progress.percentage)}%)
        </Text>
      </View>

      <ScrollView style={styles.checklistContainer}>
        {categories.map(category => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {category === 'custom' ? '추가 항목' : category}
            </Text>
            
            {checklist
              .filter(item => item.category === category)
              .map(item => (
                <View key={item.id} style={styles.checklistItem}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => toggleItemCompletion(item.id)}
                  >
                    <View style={[
                      styles.checkbox,
                      item.completed && styles.checkboxChecked
                    ]}>
                      {item.completed && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.itemContent}
                    onPress={() => editItem(item)}
                  >
                    <Text style={[
                      styles.itemTitle,
                      item.completed && styles.itemTitleCompleted
                    ]}>
                      {item.title}
                    </Text>
                    
                    {item.quantity > 1 && (
                      <Text style={styles.quantityBadge}>
                        {item.quantity}개
                      </Text>
                    )}
                    
                    {item.description && (
                      <Text style={styles.itemDescription}>
                        {item.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                  
                  {item.category === 'custom' && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteItem(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
          </View>
        ))}
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.addButton} onPress={addCustomItem}>
          <Text style={styles.addButtonText}>+ 항목 추가</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.completeButton, progress.percentage === 100 && styles.completeButtonActive]}
          onPress={() => {
            if (progress.percentage === 100) {
              Alert.alert('완료!', '모든 항목을 체크하셨습니다! 🎉');
            } else {
              Alert.alert('알림', `아직 ${progress.total - progress.completed}개 항목이 남아있습니다.`);
            }
          }}
        >
          <Text style={styles.completeButtonText}>
            {progress.percentage === 100 ? '모두 완료! 🎉' : '완료 확인'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 편집 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem?.category === 'custom' ? '항목 추가/편집' : '항목 편집'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="항목 이름"
              value={editingItem?.title || ''}
              onChangeText={(text) => 
                setEditingItem(prev => prev ? { ...prev, title: text } : null)
              }
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="설명 (선택사항)"
              multiline
              numberOfLines={3}
              value={editingItem?.description || ''}
              onChangeText={(text) => 
                setEditingItem(prev => prev ? { ...prev, description: text } : null)
              }
            />
            
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>수량:</Text>
              <TextInput
                style={styles.quantityInput}
                keyboardType="numeric"
                value={editingItem?.quantity.toString() || '1'}
                onChangeText={(text) => {
                  const quantity = parseInt(text) || 1;
                  setEditingItem(prev => prev ? { ...prev, quantity } : null);
                }}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingItem(null);
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveItem}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  checklistContainer: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  quantityBadge: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#9ca3af',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  completeButtonActive: {
    backgroundColor: '#dc2626',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 12,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#dc2626',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});