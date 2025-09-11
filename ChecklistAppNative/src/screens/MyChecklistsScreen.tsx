import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useChecklistStore } from '../stores/checklistStore';
import { useAuthStore } from '../stores/authStore';
import { Checklist } from '../types';

interface MyChecklistsScreenProps {
  navigation: any;
}

const ChecklistCard: React.FC<{
  checklist: Checklist;
  onPress: () => void;
  onShare: () => void;
  onDelete: () => void;
}> = ({ checklist, onPress, onShare, onDelete }) => {
  const completedItems = checklist.items.filter(item => item.isCompleted).length;
  const totalItems = checklist.items.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{checklist.title}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={onShare}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.shareButtonText}>공유</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteButtonText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {checklist.description && (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {checklist.description}
        </Text>
      )}
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completedItems}/{totalItems} 완료 ({Math.round(progress)}%)
        </Text>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.itemCount}>
          📋 {totalItems}개 항목
        </Text>
        {checklist.isCollaborative && (
          <View style={styles.collaborativeBadge}>
            <Text style={styles.collaborativeBadgeText}>👥 협업</Text>
          </View>
        )}
        {checklist.peopleCount && checklist.peopleCount > 1 && (
          <Text style={styles.peopleCount}>
            👤 {checklist.peopleCount}명
          </Text>
        )}
      </View>
      
      <Text style={styles.cardDate}>
        {new Date(checklist.createdAt).toLocaleDateString('ko-KR')}
      </Text>
    </TouchableOpacity>
  );
};

export const MyChecklistsScreen: React.FC<MyChecklistsScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mine' | 'shared'>('all');

  const { 
    checklists, 
    loading, 
    error, 
    fetchChecklists, 
    deleteChecklist, 
    shareChecklist 
  } = useChecklistStore();
  
  const { user, signOut } = useAuthStore();

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    await fetchChecklists();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChecklists();
    setRefreshing(false);
  };

  const handleChecklistPress = (checklist: Checklist) => {
    navigation.navigate('ChecklistDetail', { 
      checklistId: checklist.id,
      checklistTitle: checklist.title 
    });
  };

  const handleShareChecklist = async (checklist: Checklist) => {
    try {
      const result = await shareChecklist(checklist.id);
      Alert.alert(
        '공유 코드 생성 완료',
        `공유 코드: ${result.shareCode}\n\n이 코드를 친구에게 알려주세요!`,
        [
          { text: '확인', style: 'default' }
        ]
      );
    } catch (error) {
      Alert.alert('오류', '체크리스트 공유에 실패했습니다.');
    }
  };

  const handleDeleteChecklist = (checklist: Checklist) => {
    Alert.alert(
      '체크리스트 삭제',
      `"${checklist.title}"를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => deleteChecklist(checklist.id)
        }
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          onPress: async () => {
            await signOut();
            navigation.replace('Auth');
          }
        }
      ]
    );
  };

  const filteredChecklists = checklists.filter(checklist => {
    if (filter === 'mine') {
      return checklist.userId === user?.id;
    } else if (filter === 'shared') {
      // 현재 사용자가 참여중인 협업 체크리스트만 표시
      return checklist.isCollaborative && 
             checklist.participants?.some(p => p.userId === user?.id);
    }
    return true;
  });

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📋</Text>
      <Text style={styles.emptyTitle}>체크리스트가 없습니다</Text>
      <Text style={styles.emptySubtitle}>
        새로운 체크리스트를 만들어보세요!
      </Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('TemplateSelection')}
      >
        <Text style={styles.createButtonText}>+ 새 체크리스트</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <Text style={styles.welcomeText}>
          안녕하세요, {user?.nickname || '게스트'}님! 👋
        </Text>
        {user?.userType === 'REGISTERED' && user.friendCode && (
          <Text style={styles.friendCode}>
            내 친구코드: {user.friendCode}
          </Text>
        )}
      </View>
      
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.friendsButton}
          onPress={() => navigation.navigate('Friends')}
        >
          <Text style={styles.friendsButtonText}>👥 친구</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity 
        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
          전체
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.filterButton, filter === 'mine' && styles.filterButtonActive]}
        onPress={() => setFilter('mine')}
      >
        <Text style={[styles.filterButtonText, filter === 'mine' && styles.filterButtonTextActive]}>
          내가 만든 것
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.filterButton, filter === 'shared' && styles.filterButtonActive]}
        onPress={() => setFilter('shared')}
      >
        <Text style={[styles.filterButtonText, filter === 'shared' && styles.filterButtonTextActive]}>
          공유된 것
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderFilterButtons()}
      
      {filteredChecklists.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredChecklists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChecklistCard
              checklist={item}
              onPress={() => handleChecklistPress(item)}
              onShare={() => handleShareChecklist(item)}
              onDelete={() => handleDeleteChecklist(item)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('TemplateSelection')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  friendCode: {
    fontSize: 12,
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  friendsButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  friendsButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // FAB 공간
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  shareButton: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  shareButtonText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  collaborativeBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  collaborativeBadgeText: {
    fontSize: 10,
    color: '#1D4ED8',
  },
  peopleCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardDate: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});