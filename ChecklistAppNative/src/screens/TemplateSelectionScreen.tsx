import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SITUATION_TEMPLATES } from '../lib/templates';
import { getSmartRecommendations, UserContext } from '../lib/recommendations';
import { SituationTemplate } from '../types';
import { useChecklistStore } from '../stores/checklistStore';
import { useAuthStore } from '../stores/authStore';

interface TemplateSelectionScreenProps {
  navigation: any;
}

export const TemplateSelectionScreen: React.FC<TemplateSelectionScreenProps> = ({
  navigation,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<SituationTemplate | null>(null);
  const [peopleCount, setPeopleCount] = useState('1');
  const [smartRecommendations, setSmartRecommendations] = useState<{
    templates: SituationTemplate[];
    additionalItems: any[];
    reasoning: string;
  }>({ templates: [], additionalItems: [], reasoning: '' });

  const { createChecklist, loading } = useChecklistStore();
  const { user, upgradeGuestToRegistered } = useAuthStore();

  // 스마트 추천 시스템 초기화
  useEffect(() => {
    const loadSmartRecommendations = async () => {
      try {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        
        const context: UserContext = {
          time: {
            timeOfDay: hour < 6 ? 'dawn' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'night',
            dayOfWeek: dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday'
          },
          weather: {
            condition: 'sunny',
            season: getCurrentSeason()
          }
        };
        
        const recommendations = await getSmartRecommendations(context);
        setSmartRecommendations(recommendations);
      } catch (error) {
        console.error('추천 로딩 실패:', error);
      }
    };
    
    loadSmartRecommendations();
  }, []);

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  };

  const showUpgradeForm = () => {
    Alert.prompt(
      '이메일 입력',
      '업그레이드할 계정의 이메일을 입력하세요',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '확인', 
          onPress: (email) => {
            if (email) {
              Alert.prompt(
                '비밀번호 입력',
                '계정의 비밀번호를 입력하세요',
                [
                  { text: '취소', style: 'cancel' },
                  { 
                    text: '업그레이드', 
                    onPress: async (password) => {
                      if (password) {
                        const result = await upgradeGuestToRegistered(email, password);
                        if (result.error) {
                          Alert.alert('오류', result.error);
                        } else {
                          Alert.alert('성공', '계정이 업그레이드되었습니다!');
                        }
                      }
                    }
                  }
                ],
                'secure-text'
              );
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleTemplateSelection = (template: SituationTemplate) => {
    setSelectedTemplate(template);
  };

  const handleCreateChecklist = async () => {
    if (!selectedTemplate) {
      Alert.alert('알림', '템플릿을 선택해주세요.');
      return;
    }

    const people = parseInt(peopleCount);
    if (isNaN(people) || people < 1 || people > 100) {
      Alert.alert('알림', '인원수는 1명에서 100명 사이로 입력해주세요.');
      return;
    }

    try {
      // 템플릿으로부터 체크리스트 생성
      const checklistData = {
        title: selectedTemplate.name,
        description: selectedTemplate.description,
        isTemplate: false,
        isPublic: false,
        peopleCount: people,
        userId: user?.id,
        items: selectedTemplate.items.map((item, index) => ({
          title: item.title,
          description: item.description || '',
          quantity: selectedTemplate.peopleMultiplier 
            ? (item.baseQuantity || 1) * people 
            : (item.baseQuantity || 1),
          unit: item.unit || '',
          order: index
        }))
      };

      const newChecklist = await createChecklist(checklistData);
      
      // 생성 완료 후 체크리스트 상세 화면으로 직접 이동
      Alert.alert(
        '체크리스트 생성 완료!',
        `"${selectedTemplate.name}" 체크리스트가 생성되었습니다.`,
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('ChecklistDetail', {
              checklistId: newChecklist.id,
              checklistTitle: newChecklist.title
            })
          }
        ]
      );
    } catch (error) {
      Alert.alert('오류', '체크리스트 생성에 실패했습니다.');
    }
  };

  const categories = Array.from(new Set(SITUATION_TEMPLATES.map(t => t.category)));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('MyChecklists')}
          >
            <Text style={styles.navButtonText}>📋 내 리스트</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Friends')}
          >
            <Text style={styles.navButtonText}>👥 친구</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>아맞다이거! 📋</Text>
        <Text style={styles.subtitle}>상황에 맞는 템플릿을 선택해보세요</Text>
        <Text style={styles.welcomeText}>
          안녕하세요, {user?.nickname || '게스트'}님! 👋
        </Text>
        {user?.userType === 'GUEST' && (
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => {
              Alert.alert(
                '계정으로 저장하기',
                '체크리스트를 계속 보관하고 모든 기기에서 동기화하려면 계정을 만드세요!',
                [
                  { text: '나중에', style: 'cancel' },
                  { text: '계정 만들기', onPress: () => {
                    Alert.alert(
                      '계정 업그레이드',
                      '현재 게스트 상태를 등록 계정으로 업그레이드하시겠습니까?',
                      [
                        { text: '취소', style: 'cancel' },
                        { text: '업그레이드', onPress: () => showUpgradeForm() }
                      ]
                    );
                  }}
                ]
              )
            }}
          >
            <Text style={styles.upgradeButtonText}>
              💾 계정으로 저장하기
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* AI 추천 섹션 */}
      {smartRecommendations.templates.length > 0 && (
        <View style={styles.aiRecommendationSection}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiIcon}>🤖</Text>
            <Text style={styles.aiTitle}>AI 추천</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          </View>
          <Text style={styles.aiReasoning}>{smartRecommendations.reasoning}</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.aiTemplatesContainer}>
            {smartRecommendations.templates.map(template => (
              <TouchableOpacity
                key={`smart-${template.id}`}
                style={[
                  styles.aiTemplateCard,
                  selectedTemplate?.id === template.id && styles.selectedCard
                ]}
                onPress={() => handleTemplateSelection(template)}
              >
                <Text style={styles.fireIcon}>🔥</Text>
                <Text style={styles.aiTemplateName}>{template.name}</Text>
                <Text style={styles.aiTemplateItemCount}>{template.items.length}개</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {smartRecommendations.additionalItems.length > 0 && (
            <View style={styles.additionalItemsContainer}>
              <Text style={styles.additionalItemsTitle}>오늘 날씨/상황 기반 추가 추천:</Text>
              <View style={styles.additionalItemsRow}>
                {smartRecommendations.additionalItems.slice(0, 3).map((item, idx) => (
                  <View key={idx} style={styles.additionalItemBadge}>
                    <Text style={styles.additionalItemText}>{item.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* 카테고리별 템플릿 */}
      {categories.map(category => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <View style={styles.templatesGrid}>
            {SITUATION_TEMPLATES
              .filter(template => template.category === category)
              .map(template => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateCard,
                    selectedTemplate?.id === template.id && styles.selectedCard
                  ]}
                  onPress={() => handleTemplateSelection(template)}
                >
                  <View style={styles.templateHeader}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <View style={styles.itemCountBadge}>
                      <Text style={styles.itemCountText}>{template.items.length}개</Text>
                    </View>
                  </View>
                  <Text style={styles.templateDescription}>{template.description}</Text>
                  <Text style={styles.templatePreview}>
                    포함 항목: {template.items.slice(0, 3).map(item => item.title).join(', ')}
                    {template.items.length > 3 && ` 외 ${template.items.length - 3}개`}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      ))}

      {/* 선택된 템플릿 정보 */}
      {selectedTemplate && (
        <View style={styles.selectedTemplateSection}>
          <Text style={styles.selectedTemplateTitle}>{selectedTemplate.name} 템플릿</Text>
          <Text style={styles.selectedTemplateDescription}>{selectedTemplate.description}</Text>
          
          {selectedTemplate.peopleMultiplier && (
            <View style={styles.peopleCountSection}>
              <Text style={styles.peopleCountLabel}>인원 수</Text>
              <TextInput
                style={styles.peopleCountInput}
                value={peopleCount}
                onChangeText={setPeopleCount}
                keyboardType="numeric"
                placeholder="1"
              />
              <Text style={styles.peopleCountHint}>
                인원 수에 따라 개인 준비물 수량이 자동으로 조정됩니다
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.createButton, loading && styles.createButtonDisabled]} 
            onPress={handleCreateChecklist}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>이 템플릿 사용하기</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  aiRecommendationSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: 'bold',
  },
  aiReasoning: {
    fontSize: 14,
    color: '#1d4ed8',
    marginBottom: 16,
  },
  aiTemplatesContainer: {
    marginBottom: 16,
  },
  aiTemplateCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    minWidth: 120,
    alignItems: 'center',
  },
  fireIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  aiTemplateName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  aiTemplateItemCount: {
    fontSize: 12,
    color: '#666',
  },
  additionalItemsContainer: {
    backgroundColor: '#fefce8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#facc15',
  },
  additionalItemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#a16207',
    marginBottom: 8,
  },
  additionalItemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  additionalItemBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
    borderRadius: 4,
  },
  additionalItemText: {
    fontSize: 12,
    color: '#a16207',
  },
  categorySection: {
    margin: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  templateCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  itemCountBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemCountText: {
    fontSize: 12,
    color: '#666',
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  templatePreview: {
    fontSize: 12,
    color: '#888',
  },
  selectedTemplateSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  selectedTemplateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  selectedTemplateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  peopleCountSection: {
    marginBottom: 16,
  },
  peopleCountLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  peopleCountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    width: 100,
    marginBottom: 8,
  },
  peopleCountHint: {
    fontSize: 14,
    color: '#666',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    gap: 12,
  },
  navButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  upgradeButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});