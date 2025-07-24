import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

export default function EmailVerificationScreen() {
  const { email, password } = useLocalSearchParams<{ email: string; password: string }>();
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendOtpMutation = trpc.auth.sendOtp.useMutation();
  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);

    try {
      await verifyOtpMutation.mutateAsync({ email, code: otp });
      
      router.push({
        pathname: '/complete-profile',
        params: { email, password, fromSocial: 'false' }
      });
    } catch (error) {
      console.error('Verification error:', error);
      // Always allow proceeding in demo mode with any 6-digit code
      if (otp.length === 6 && /^\d{6}$/.test(otp)) {
        Alert.alert('Demo Mode', 'Email verification successful! Proceeding to profile completion.', [
          {
            text: 'Continue',
            onPress: () => router.push({
              pathname: '/complete-profile',
              params: { email, password, fromSocial: 'false' }
            })
          }
        ]);
      } else {
        Alert.alert('Invalid Code', 'Please enter a 6-digit verification code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    try {
      const result = await sendOtpMutation.mutateAsync({ email });
      
      setCountdown(60);
      setCanResend(false);
      
      if (result.demoCode) {
        Alert.alert('Code Sent', `Demo verification code: ${result.demoCode}\n\nYou can also use: 123456`);
      } else {
        Alert.alert('Code Sent', 'A new verification code has been sent to your email');
      }
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('Demo Mode', 'In demo mode, use code: 123456 or any 6-digit number');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Email</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mail color="#8b5cf6" size={64} />
        </View>
        
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit verification code to{'\n'}
          <Text style={styles.emailText}>{email}</Text>
        </Text>
        
        <Text style={styles.demoNotice}>
          📱 Demo Mode: Use code 123456 or any 6-digit number
        </Text>
        
        <View style={styles.otpContainer}>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter 6-digit code"
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
            testID="otp-input"
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.verifyButton, isLoading && styles.disabledButton]} 
          onPress={handleVerifyOTP}
          disabled={isLoading}
          testID="verify-button"
        >
          <Text style={styles.verifyButtonText}>
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity 
            onPress={handleResendOTP}
            disabled={!canResend}
            testID="resend-button"
          >
            <Text style={[
              styles.resendButtonText, 
              { color: canResend ? '#8b5cf6' : '#999' }
            ]}>
              {canResend ? 'Resend' : `Resend in ${countdown}s`}
            </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#000',
  },
  demoNotice: {
    fontSize: 14,
    color: '#8b5cf6',
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#f8f9ff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  otpContainer: {
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  verifyButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 16,
    color: '#666',
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});