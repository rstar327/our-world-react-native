// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://dgmdjsqvnhbzvwiiwhpu.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbWRqc3F2bmhienZ3aWl3aHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNTE1MzgsImV4cCI6MjA2ODkyNzUzOH0.ya0XkDJoR61Cw5tWk5NZbxjfpIqhqMKLopg2BU0eD4c'; // Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// app.config.js or app.json
export default {
  expo: {
    name: "OurWorld",
    slug: "ourworld",
    scheme: "ourworld", // Your app scheme for deep linking
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.ourworld", // Replace with your bundle ID
      googleServicesFile: "./GoogleService-Info.plist" // Add Google Services file
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.yourcompany.ourworld", // Replace with your package name
      googleServicesFile: "./google-services.json" // Add Google Services file
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-auth-session",
        {
          scheme: "ourworld"
        }
      ],
      "expo-apple-authentication"
    ]
  }
};

// Installation commands (run these in your terminal):
/*
npm install @supabase/supabase-js @react-native-async-storage/async-storage
npm install expo-auth-session expo-web-browser expo-apple-authentication
npm install react-native-url-polyfill

// For Google Sign-In
npm install expo-auth-session

// For Facebook Sign-In  
npm install expo-facebook

// For Apple Sign-In (iOS only)
npm install expo-apple-authentication
*/