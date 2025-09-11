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
  ActivityIndicator,
} from 'react-native';
import { Checklist, ChecklistItem } from '../types';
import { useChecklistStore } from '../stores/checklistStore';
import { useAuthStore } from '../stores/authStore';

interface ChecklistDetailScreenProps {
  navigation: any;
  route: {
    params: {
      checklistId: string;
      checklistTitle?: string;
    };
  };
}

export const ChecklistDetailScreen: React.FC<ChecklistDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { checklistId, checklistTitle } = route.params;
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');

  const { 
    currentChecklist, 
    loading, 
    error, 
    fetchChecklist, 
    toggleItemComplete, 
    addItem, 
    updateItem, 
    deleteItem,
    shareChecklist
  } = useChecklistStore();
  
  const { user } = useAuthStore();

  // Set screen title from params or checklist data
  useEffect(() => {
    if (checklistTitle) {
      navigation.setOptions({
        title: checklistTitle
      });
    } else if (currentChecklist) {
      navigation.setOptions({
        title: currentChecklist.title
      });
    }
  }, [checklistTitle, currentChecklist, navigation]);

  useEffect(() => {
    if (checklistId) {
      fetchChecklist(checklistId);
    }
  }, [checklistId]);

  // 협업 체크리스트의 경우 주기적으로 새로고침
  useEffect(() => {
    if (currentChecklist?.isCollaborative) {
      const interval = setInterval(() => {
        fetchChecklist(checklistId);
      }, 10000); // 10초마다 새로고침
      
      return () => clearInterval(interval);
    }
  }, [currentChecklist?.isCollaborative, checklistId]);

  const handleToggleItem = (itemId: string) => {
    toggleItemComplete(itemId);
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) {
      Alert.alert('오류', '항목 제목을 입력해주세요.');
      return;
    }

    if (!currentChecklist) return;

    try {
      await addItem(currentChecklist.id, {
        title: newItemTitle.trim(),
        description: newItemDescription.trim(),
        quantity: parseInt(newItemQuantity) || 1,
        unit: '개',
        isCompleted: false,
        order: currentChecklist.items.length,
      });

      setNewItemTitle('');
      setNewItemDescription('');
      setNewItemQuantity('1');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('오류', '항목 추가에 실패했습니다.');
    }
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      '항목 삭제',
      '이 항목을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => deleteItem(itemId)
        }
      ]
    );
  };

  const handleShareChecklist = async () => {
    if (!currentChecklist || !user) return;

    try {
      const { shareCode } = await shareChecklist(currentChecklist.id);
      Alert.alert(
        '공유 코드 생성 완료',
        `공유 코드: ${shareCode}\n\n이 코드를 친구에게 알려주세요!`,
        [
          { text: '확인', style: 'default' }
        ]
      );
    } catch (error) {
      Alert.alert('오류', '체크리스트 공유에 실패했습니다.');
    }
  };

  const calculateProgress = () => {
    if (!currentChecklist || currentChecklist.items.length === 0) return 0;
    const completedItems = currentChecklist.items.filter(item => item.isCompleted).length;
    return (completedItems / currentChecklist.items.length) * 100;
  };

  const renderAddItemModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>새 항목 추가</Text>
          
          <TextInput
            style={styles.modalInput}
            placeholder="항목 제목 *"
            value={newItemTitle}
            onChangeText={setNewItemTitle}
            placeholderTextColor="#9CA3AF"
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder="설명 (선택)"
            value={newItemDescription}
            onChangeText={setNewItemDescription}
            placeholderTextColor="#9CA3AF"
            multiline
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder="수량"
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.addButton]}
              onPress={handleAddItem}
            >
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && !currentChecklist) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>체크리스트를 불러오는 중...</Text>
      </View>
    );
  }

  if (error || !currentChecklist) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || '체크리스트를 찾을 수 없습니다.'}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = calculateProgress();
  const completedItems = currentChecklist.items.filter(item => item.isCompleted).length;

  return (
    <View style={styles.container}>
      {/* Header with progress */}
      <View style={styles.header}>
        <View style={styles.headerActions}>
          {currentChecklist.userId === user?.id && (
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={handleShareChecklist}
            >
              <Text style={styles.shareButtonText}>공유</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title}>{currentChecklist.title}</Text>
        {currentChecklist.description && (
          <Text style={styles.description}>{currentChecklist.description}</Text>
        )}
        
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedItems}/{currentChecklist.items.length} 완료 ({Math.round(progress)}%)
          </Text>
        </View>

        {/* Participants (if collaborative) */}
        {currentChecklist.isCollaborative && currentChecklist.participants && (
          <View style={styles.participantsSection}>
            <Text style={styles.participantsTitle}>참여자</Text>
            <View style={styles.participantsList}>
              {currentChecklist.participants.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <View style={[styles.participantAvatar, { backgroundColor: participant.color }]}>
                    <Text style={styles.participantText}>
                      {participant.nickname.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.participantName}>{participant.nickname}</Text>
                  {participant.role === 'OWNER' && (
                    <Text style={styles.ownerBadge}>👑</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Items list */}
      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        {currentChecklist.items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.itemCard, item.isCompleted && styles.completedItem]}
            onPress={() => handleToggleItem(item.id)}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.checkbox, item.isCompleted && styles.checkedBox]}>
                {item.isCompleted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, item.isCompleted && styles.completedText]}>
                  {item.title}
                </Text>
                {item.description && (
                  <Text style={[styles.itemDescription, item.isCompleted && styles.completedText]}>
                    {item.description}
                  </Text>
                )}
                {item.quantity && item.quantity > 1 && (
                  <Text style={styles.itemQuantity}>
                    수량: {item.quantity}{item.unit}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(item.id)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add item button */}
      <TouchableOpacity 
        style={styles.addItemButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addItemButtonText}>+ 항목 추가</Text>
      </TouchableOpacity>

      {renderAddItemModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  participantsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  participantName: {
    fontSize: 12,
    color: '#6B7280',
  },
  ownerBadge: {
    fontSize: 12,
  },
  itemsList: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedItem: {
    backgroundColor: '#F3F4F6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addItemButton: {
    backgroundColor: '#dc2626',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addItemButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#dc2626',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});