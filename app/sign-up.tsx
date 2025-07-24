import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const sendOtpMutation = trpc.auth.sendOtp.useMutation();
  
  const handleSocialSignUp = (provider: string) => {
    Alert.alert('Social Sign Up', `${provider} signup would retrieve your name and email automatically`, [
      {
        text: 'Demo Sign Up',
        onPress: () => {
          router.push({
            pathname: '/complete-profile',
            params: { 
              email: 'john.doe@example.com',
              firstName: 'John',
              lastName: 'Doe',
              fromSocial: 'true'
            }
          });
        },
      },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };
  
  const handleEmailSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await sendOtpMutation.mutateAsync({ email });
      
      if (result.demoCode) {
        Alert.alert(
          'Demo Mode', 
          `Verification code: ${result.demoCode}\n\nIn demo mode, you can also use: 123456`,
          [
            {
              text: 'Continue',
              onPress: () => router.push({
                pathname: '/email-verification',
                params: { email, password }
              })
            }
          ]
        );
      } else {
        router.push({
          pathname: '/email-verification',
          params: { email, password }
        });
      }
    } catch (error) {
      console.error('OTP Error:', error);
      Alert.alert(
        'Demo Mode', 
        'Email verification is in demo mode. Use code: 123456',
        [
          {
            text: 'Continue',
            onPress: () => router.push({
              pathname: '/email-verification',
              params: { email, password }
            })
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign Up</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Join OurWorld and start having people around</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Mail color="#666" size={20} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              testID="email-input"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Lock color="#666" size={20} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password (min 6 characters)"
              secureTextEntry
              testID="password-input"
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.signUpButton, isLoading && styles.disabledButton]} 
            onPress={handleEmailSignUp}
            disabled={isLoading}
            testID="email-sign-up-button"
          >
            <Text style={styles.signUpButtonText}>
              {isLoading ? 'Sending...' : 'Continue with Email'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialSignUp('Google')}
            testID="google-signup-button"
          >
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialSignUp('Facebook')}
            testID="facebook-signup-button"
          >
            <View style={[styles.socialIcon, { backgroundColor: '#1877F2' }]}>
              <Text style={styles.socialIconText}>f</Text>
            </View>
            <Text style={styles.socialButtonText}>Continue with Facebook</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialSignUp('Apple')}
            testID="apple-signup-button"
          >
            <View style={[styles.socialIcon, { backgroundColor: '#000' }]}>
              <Text style={styles.socialIconText}>🍎</Text>
            </View>
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/sign-in')}>
            <Text style={styles.signInLinkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 32,
  },
  socialContainer: {
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  socialIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  googleIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  socialIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 20,
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#000',
  },
  signUpButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  signInLinkText: {
    fontSize: 16,
    color: '#8b5cf6',
    fontWeight: '600',
  },
});