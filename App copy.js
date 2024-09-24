import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import AuthNavigator from './src/navigation/AuthNavigator';

// 1. ตอน Build Error : Invariant Violation: requireNativeComponent: "RNSScreen" was not found in the UIManager.
// แก้ปัญหาด้วยการลงตัวนี้
enableScreens();

// 2. ตอน Build Error : Invariant Violation: requireNativeComponent: "RNCSafeAreaProvider" was not found in the UIManager.
// ก็เลยต้องมา Wrap SafeAreaProvider เพิ่ม
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthNavigator />;
    </SafeAreaProvider>
  );
}