import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFriendStore } from '../stores/friendStore';
import { useChecklistStore } from '../stores/checklistStore';
import { useAuthStore } from '../stores/authStore';
import { Friend, FriendRequest, RecentCollaboration } from '../types';

interface FriendSystemScreenProps {
  navigation: any;
}

const FriendCard: React.FC<{
  friend: Friend;
  onRemove: () => void;
}> = ({ friend, onRemove }) => (
  <View style={styles.friendCard}>
    <View style={styles.friendInfo}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {friend.nickname.charAt(0).toUpperCase()}
        </Text>
        {friend.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.friendDetails}>
        <Text style={styles.friendName}>{friend.nickname}</Text>
        <Text style={styles.friendStatus}>
          {friend.userType === 'REGISTERED' ? '등록 사용자' : '게스트 사용자'}
        </Text>
        <Text style={styles.friendDate}>
          {new Date(friend.addedAt).toLocaleDateString('ko-KR')}에 추가
        </Text>
      </View>
    </View>
    <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
      <Text style={styles.removeButtonText}>삭제</Text>
    </TouchableOpacity>
  </View>
);

const FriendRequestCard: React.FC<{
  request: FriendRequest;
  onAccept: () => void;
  onDecline: () => void;
}> = ({ request, onAccept, onDecline }) => (
  <View style={styles.requestCard}>
    <View style={styles.requestInfo}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {request.senderNickname.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.requestDetails}>
        <Text style={styles.requestName}>{request.senderNickname}</Text>
        <Text style={styles.requestDate}>
          {new Date(request.sentAt).toLocaleDateString('ko-KR')}
        </Text>
      </View>
    </View>
    <View style={styles.requestActions}>
      <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
        <Text style={styles.acceptButtonText}>수락</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
        <Text style={styles.declineButtonText}>거절</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const CollaborationCard: React.FC<{
  collaboration: RecentCollaboration;
  onJoin: () => void;
  onRemove: () => void;
}> = ({ collaboration, onJoin, onRemove }) => {
  const progress = collaboration.totalItems > 0 
    ? (collaboration.completedItems / collaboration.totalItems) * 100 
    : 0;

  return (
    <View style={styles.collaborationCard}>
      <View style={styles.collaborationHeader}>
        <Text style={styles.collaborationTitle}>{collaboration.title}</Text>
        <TouchableOpacity onPress={onRemove}>
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.collaborationCode}>코드: {collaboration.shareCode}</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {collaboration.completedItems}/{collaboration.totalItems} 완료
        </Text>
      </View>
      
      <View style={styles.participantsContainer}>
        {collaboration.participants.map((participant, index) => (
          <View key={index} style={[styles.participantDot, { backgroundColor: participant.color }]}>
            <Text style={styles.participantText}>
              {participant.nickname.charAt(0)}
            </Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
        <Text style={styles.joinButtonText}>참여하기</Text>
      </TouchableOpacity>
    </View>
  );
};

export const FriendSystemScreen: React.FC<FriendSystemScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add' | 'collaborate'>('friends');
  const [friendCode, setFriendCode] = useState('');
  const [shareCode, setShareCode] = useState('');

  const {
    friends,
    friendRequests,
    recentCollaborations,
    loading,
    error,
    addFriendByCode,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    loadFriends,
    loadFriendRequests,
    loadRecentCollaborations,
    addRecentCollaboration,
    removeRecentCollaboration,
  } = useFriendStore();

  const { joinCollaborativeChecklist } = useChecklistStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
    loadRecentCollaborations();
  }, []);

  const handleAddFriend = async () => {
    if (!friendCode.trim()) {
      Alert.alert('오류', '친구 코드를 입력해주세요.');
      return;
    }

    const result = await addFriendByCode(friendCode.trim().toUpperCase());
    if (result.error) {
      Alert.alert('오류', result.error);
    } else {
      Alert.alert('성공', '친구 요청을 보냈습니다!');
      setFriendCode('');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    const result = await acceptFriendRequest(requestId);
    if (result.error) {
      Alert.alert('오류', result.error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    const result = await declineFriendRequest(requestId);
    if (result.error) {
      Alert.alert('오류', result.error);
    }
  };

  const handleRemoveFriend = (friend: Friend) => {
    Alert.alert(
      '친구 삭제',
      `${friend.nickname}님을 친구 목록에서 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => removeFriend(friend.friendId)
        }
      ]
    );
  };

  const handleJoinCollaboration = async (shareCode: string) => {
    try {
      const joinedChecklist = await joinCollaborativeChecklist(shareCode);
      Alert.alert(
        '협업 참여 완료!', 
        `"${joinedChecklist.title}" 체크리스트에 참여했습니다!`,
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('ChecklistDetail', {
              checklistId: joinedChecklist.id,
              checklistTitle: joinedChecklist.title
            })
          }
        ]
      );
    } catch (error) {
      Alert.alert('오류', '협업 참여에 실패했습니다.');
    }
  };

  const handleJoinByCode = async () => {
    if (!shareCode.trim()) {
      Alert.alert('오류', '공유 코드를 입력해주세요.');
      return;
    }

    await handleJoinCollaboration(shareCode.trim().toUpperCase());
    setShareCode('');
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
        onPress={() => setActiveTab('friends')}
      >
        <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
          친구 ({friends.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
        onPress={() => setActiveTab('requests')}
      >
        <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
          요청 ({friendRequests.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'add' && styles.activeTab]}
        onPress={() => setActiveTab('add')}
      >
        <Text style={[styles.tabText, activeTab === 'add' && styles.activeTabText]}>
          친구 추가
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'collaborate' && styles.activeTab]}
        onPress={() => setActiveTab('collaborate')}
      >
        <Text style={[styles.tabText, activeTab === 'collaborate' && styles.activeTabText]}>
          협업
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFriendsTab = () => (
    <View style={styles.tabContent}>
      {friends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyTitle}>친구가 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            친구 코드로 친구를 추가해보세요!
          </Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FriendCard
              friend={item}
              onRemove={() => handleRemoveFriend(item)}
            />
          )}
        />
      )}
    </View>
  );

  const renderRequestsTab = () => (
    <View style={styles.tabContent}>
      {friendRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📮</Text>
          <Text style={styles.emptyTitle}>친구 요청이 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            새로운 친구 요청이 오면 여기에 표시됩니다.
          </Text>
        </View>
      ) : (
        <FlatList
          data={friendRequests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FriendRequestCard
              request={item}
              onAccept={() => handleAcceptRequest(item.id)}
              onDecline={() => handleDeclineRequest(item.id)}
            />
          )}
        />
      )}
    </View>
  );

  const renderAddTab = () => (
    <ScrollView style={styles.tabContent}>
      {user?.friendCode && (
        <View style={styles.myCodeContainer}>
          <Text style={styles.sectionTitle}>내 친구 코드</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.myCode}>{user.friendCode}</Text>
          </View>
          <Text style={styles.codeSubtitle}>
            이 코드를 친구에게 알려주세요!
          </Text>
        </View>
      )}
      
      <View style={styles.addFriendContainer}>
        <Text style={styles.sectionTitle}>친구 코드로 추가</Text>
        <TextInput
          style={styles.codeInput}
          placeholder="친구 코드 입력 (예: ABC123)"
          value={friendCode}
          onChangeText={setFriendCode}
          autoCapitalize="characters"
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddFriend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>친구 요청 보내기</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderCollaborateTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.joinContainer}>
        <Text style={styles.sectionTitle}>공유 코드로 참여</Text>
        <TextInput
          style={styles.codeInput}
          placeholder="공유 코드 입력 (예: SHARE123)"
          value={shareCode}
          onChangeText={setShareCode}
          autoCapitalize="characters"
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity 
          style={styles.joinCodeButton} 
          onPress={handleJoinByCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.joinCodeButtonText}>협업 참여하기</Text>
          )}
        </TouchableOpacity>
      </View>

      {recentCollaborations.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>최근 협업</Text>
          {recentCollaborations.map((collaboration) => (
            <CollaborationCard
              key={collaboration.id}
              collaboration={collaboration}
              onJoin={() => handleJoinCollaboration(collaboration.shareCode)}
              onRemove={() => removeRecentCollaboration(collaboration.id)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {renderTabBar()}
      
      {activeTab === 'friends' && renderFriendsTab()}
      {activeTab === 'requests' && renderRequestsTab()}
      {activeTab === 'add' && renderAddTab()}
      {activeTab === 'collaborate' && renderCollaborateTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#dc2626',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
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
  },
  friendCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  friendStatus: {
    fontSize: 14,
    color: '#6B7280',
  },
  friendDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  removeButton: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestDetails: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  requestDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  declineButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  myCodeContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  codeContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  myCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    letterSpacing: 2,
  },
  codeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  addFriendContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  joinContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  joinCodeButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinCodeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentContainer: {
    margin: 16,
  },
  collaborationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  collaborationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collaborationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  removeText: {
    fontSize: 20,
    color: '#6B7280',
    paddingHorizontal: 8,
  },
  collaborationCode: {
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
  participantsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  participantDot: {
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
  joinButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});