import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, LayoutAnimation, Platform, UIManager, Pressable, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useUserStore } from '../store/useUserStore';
import { M3Pressable } from '../components/M3Pressable';
import { simulateEmailAuth } from '../services/auth';
import { getLocalUsers, saveLocalUser } from '../services/secureStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateProfile, login } = useUserStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [lang, setLang] = useState('Python');
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Email login / signup flow states
  const [emailMode, setEmailMode] = useState<'none' | 'login' | 'signup'>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(val)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    } else if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailAuth = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    if (!isEmailValid || !isPasswordValid) return;

    setLoadingAuth(true);
    try {
      const isSignUp = emailMode === 'signup';
      const result = await simulateEmailAuth(email, password, isSignUp);
      if (result) {
        await login({ accessToken: result.accessToken, idToken: result.idToken }, result.progress);
        
        if (result.hasCompletedOnboarding) {
          // User already completed onboarding in a previous session! Skip Step 2
          await updateProfile({
            userName: result.name,
            preferredLanguage: result.preferredLanguage as any,
            hasCompletedOnboarding: true
          });
          router.replace('/');
        } else {
          // Go to personalization step 2
          setName(result.name);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setStep(2);
        }
      }
    } catch (err: any) {
      console.error('Email authentication failed:', err);
      const msg = err.message || '';
      if (msg.includes('already exists')) {
        setEmailError('User already exists. Please Sign In.');
      } else if (msg.includes('No account found')) {
        setEmailError('Account not found. Please Sign Up.');
      } else if (msg.includes('Incorrect password')) {
        setPasswordError('Incorrect password. Please try again.');
      } else {
        setEmailError('Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const switchEmailMode = (mode: 'none' | 'login' | 'signup') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEmailMode(mode);
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setEmailError('');
    setPasswordError('');
  };

  const handleNextStep = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep(2);
  };

  const completeOnboarding = async () => {
    const trimmedName = name.trim().slice(0, 50);
    
    // Save to SecureStore to persist name and language for email users
    if (email) {
      const users = await getLocalUsers();
      const existing = users[email.toLowerCase().trim()];
      if (existing) {
        await saveLocalUser(email, {
          passwordHash: existing.passwordHash,
          name: trimmedName || 'Scholar',
          preferredLanguage: lang,
          hasCompletedOnboarding: true,
        });
      }
    }

    await updateProfile({
      userName: trimmedName || 'Scholar',
      preferredLanguage: lang as any,
      hasCompletedOnboarding: true
    });
    router.replace('/');
  };

  if (step === 1) {
    if (emailMode === 'none') {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Master DSA Patterns</Text>
            <Text style={styles.subtitle}>240 curated interview problems organized into 30 proven patterns.</Text>
            
            <M3Pressable 
              style={[styles.button, { marginBottom: 12 }]} 
              onPress={handleNextStep}
              disabled={loadingAuth}
            >
              <Text style={styles.buttonText}>Start Learning (Guest)</Text>
            </M3Pressable>

            <M3Pressable 
              style={[styles.button, styles.emailButton]} 
              onPress={() => switchEmailMode('login')}
              disabled={loadingAuth}
            >
              <Text style={styles.emailButtonText}>
                Continue with Email
              </Text>
            </M3Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {emailMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {emailMode === 'login' 
              ? 'Sign in to sync your DSA pattern progress.' 
              : 'Create an account to track your solved problems.'}
          </Text>

          <TextInput
            style={[styles.input, emailError ? styles.inputError : null, { marginBottom: emailError ? 8 : 20 }]}
            placeholder="Email Address"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) validateEmail(text);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            editable={!loadingAuth}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null, { paddingRight: 60, marginBottom: passwordError ? 8 : 24 }]}
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) validatePassword(text);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loadingAuth}
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loadingAuth}
            >
              <Text style={styles.eyeButtonText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <M3Pressable 
            style={[styles.button, { marginTop: 8 }]} 
            onPress={handleEmailAuth}
            disabled={loadingAuth}
          >
            <Text style={styles.buttonText}>
              {loadingAuth 
                ? 'Connecting...' 
                : emailMode === 'login' ? 'Sign In' : 'Sign Up'}
            </Text>
          </M3Pressable>

          <M3Pressable 
            style={styles.toggleModeButton} 
            onPress={() => switchEmailMode(emailMode === 'login' ? 'signup' : 'login')}
            disabled={loadingAuth}
          >
            <Text style={styles.toggleModeText}>
              {emailMode === 'login' 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Sign In"}
            </Text>
          </M3Pressable>

          <M3Pressable 
            style={styles.backButton} 
            onPress={() => switchEmailMode('none')}
            disabled={loadingAuth}
          >
            <Text style={styles.backButtonText}>← Back to Options</Text>
          </M3Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Tell us about yourself</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={(text) => setName(text.slice(0, 50))}
            maxLength={50}
          />
          <Text style={styles.label}>Preferred Language</Text>
          <View style={styles.langGrid}>
            {['Python', 'C', 'Java', 'C++'].map(l => (
              <M3Pressable
                key={l}
                style={[styles.langOption, lang === l && styles.activeLang]}
                onPress={() => setLang(l)}
              >
                <Text style={[styles.langText, lang === l && styles.activeLangText]}>{l}</Text>
              </M3Pressable>
            ))}
          </View>
          <M3Pressable style={styles.button} onPress={completeOnboarding}>
            <Text style={styles.buttonText}>Finish Setup</Text>
          </M3Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    alignSelf: 'flex-start',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 36,
  },
  langOption: {
    minWidth: 90,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLang: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary,
  },
  langText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeLangText: {
    color: Colors.onPrimaryContainer,
    fontWeight: '600',
  },


  emailButton: {
    backgroundColor: Colors.primaryContainer,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  emailButtonText: {
    color: Colors.onPrimaryContainer,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: -12,
    marginBottom: 16,
    paddingLeft: 4,
  },
  toggleModeButton: {
    marginTop: 20,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  toggleModeText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 12,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    zIndex: 10,
    padding: 4,
  },
  eyeButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

