import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { User, Bell, Shield, HelpCircle, ChevronRight, ArrowLeft } from 'lucide-react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container} testID="settings-screen">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.settingItem} testID="account">
          <View style={styles.settingLeft}>
            <User color="#666" size={24} />
            <Text style={styles.settingText}>Account</Text>
          </View>
          <ChevronRight color="#666" size={20} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} testID="notifications">
          <View style={styles.settingLeft}>
            <Bell color="#666" size={24} />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <ChevronRight color="#666" size={20} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} testID="privacy-security">
          <View style={styles.settingLeft}>
            <Shield color="#666" size={24} />
            <Text style={styles.settingText}>Privacy & Security</Text>
          </View>
          <ChevronRight color="#666" size={20} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} testID="about">
          <View style={styles.settingLeft}>
            <HelpCircle color="#666" size={24} />
            <Text style={styles.settingText}>About</Text>
          </View>
          <ChevronRight color="#666" size={20} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
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
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 15,
  },
});