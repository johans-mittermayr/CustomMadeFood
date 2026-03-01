import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/hooks/useAuth";
import { LoginScreen } from "./src/screens/LoginScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";
import { WeighingScreen } from "./src/screens/WeighingScreen";
import { colors } from "./src/theme/colors";

export type RootStackParamList = {
  Orders: undefined;
  Weighing: { orderId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.white,
        }}
      >
        <ActivityIndicator size="large" color={colors.brandRed} />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen
        name="Weighing"
        component={WeighingScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
