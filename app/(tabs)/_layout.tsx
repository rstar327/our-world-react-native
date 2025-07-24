import { Tabs } from "expo-router";
import { Globe } from "lucide-react-native";
import React from "react";

import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "OurWorld",
          tabBarIcon: ({ color }) => <Globe color={color} />,
        }}
      />
    </Tabs>
  );
}