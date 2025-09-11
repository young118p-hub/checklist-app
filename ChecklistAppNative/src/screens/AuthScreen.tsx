import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';

interface AuthScreenProps {
  navigation: any;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'guest'>('guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');

  const { user, loading, isInitialized, signIn, signUp, createGuestUser, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (user && isInitialized && !loading) {
      // 사용자가 로그인되면 메인 화면으로 이동
      navigation.replace('TemplateSelection');
    }
  }, [user, loading, isInitialized]);

  const handleAuth = async () => {
    if (mode === 'guest') {
      if (!nickname.trim()) {
        Alert.alert('오류', '닉네임을 입력해주세요.');
        return;
      }
      
      const result = await createGuestUser(nickname);
      if (result.error) {
        Alert.alert('오류', result.error);
      }
    } else if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        Alert.alert('오류', '이메일과 비밀번호를 모두 입력해주세요.');
        return;
      }
      
      const result = await signIn(email, password);
      if (result.error) {
        Alert.alert('로그인 실패', result.error);
      }
    } else if (mode === 'signup') {
      if (!email.trim() || !password.trim() || !name.trim()) {
        Alert.alert('오류', '모든 필드를 입력해주세요.');
        return;
      }
      
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        Alert.alert('오류', '올바른 이메일 주소를 입력해주세요.');
        return;
      }
      
      // 비밀번호 강도 검증
      if (password.length < 6) {
        Alert.alert('오류', '비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      
      const result = await signUp(email, password, name);
      if (result.error) {
        Alert.alert('회원가입 실패', result.error);
      }
    }
  };

  const renderGuestMode = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>게스트로 시작하기</Text>
      <Text style={styles.subtitle}>
        닉네임만으로 바로 시작하세요!
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="닉네임을 입력하세요"
        value={nickname}
        onChangeText={setNickname}
        placeholderTextColor="#9CA3AF"
      />
      
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>시작하기</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>계정이 있으신가요? </Text>
        <TouchableOpacity onPress={() => setMode('login')}>
          <Text style={styles.linkText}>로그인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoginMode = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>로그인</Text>
      <Text style={styles.subtitle}>
        계정으로 로그인하여 모든 기기에서 동기화하세요
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#9CA3AF"
      />
      
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#9CA3AF"
      />
      
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>로그인</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>계정이 없으신가요? </Text>
        <TouchableOpacity onPress={() => setMode('signup')}>
          <Text style={styles.linkText}>회원가입</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.secondaryButton} 
        onPress={() => setMode('guest')}
      >
        <Text style={styles.secondaryButtonText}>게스트로 계속하기</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignupMode = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>회원가입</Text>
      <Text style={styles.subtitle}>
        계정을 만들어 모든 기기에서 체크리스트를 동기화하세요
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="이름"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#9CA3AF"
      />
      
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#9CA3AF"
      />
      
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#9CA3AF"
      />
      
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>회원가입</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>이미 계정이 있으신가요? </Text>
        <TouchableOpacity onPress={() => setMode('login')}>
          <Text style={styles.linkText}>로그인</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.secondaryButton} 
        onPress={() => setMode('guest')}
      >
        <Text style={styles.secondaryButtonText}>게스트로 계속하기</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>앱을 시작하는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.appTitle}>아맞다이거! 🤦‍♂️</Text>
        <Text style={styles.appSubtitle}>
          깜빡할 뻔한 모든 것들을 한 번에!
        </Text>
      </View>
      
      {mode === 'guest' && renderGuestMode()}
      {mode === 'login' && renderLoginMode()}
      {mode === 'signup' && renderSignupMode()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchText: {
    color: '#6B7280',
    fontSize: 14,
  },
  linkText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: 'bold',
  },
});