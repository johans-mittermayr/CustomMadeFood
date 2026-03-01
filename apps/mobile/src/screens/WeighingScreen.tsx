import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api, Order } from "../services/api";
import { colors } from "../theme/colors";
import type { RootStackParamList } from "../../App";

type WeighingRouteProp = RouteProp<RootStackParamList, "Weighing">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Weighing">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function WeighingScreen() {
  const route = useRoute<WeighingRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const orders = await api.getKitchenOrders();
      const found = orders.find((o) => o.id === orderId);
      if (found) {
        setOrder(found);
        // If order is done, go back
        if (found.status === "ready") {
          navigation.goBack();
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [orderId, navigation]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  async function handleNext() {
    if (advancing) return;
    setAdvancing(true);
    try {
      await api.nextIngredient(orderId);
      await fetchOrder();
    } finally {
      setAdvancing(false);
    }
  }

  if (loading || !order) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brandRed} />
      </View>
    );
  }

  const currentItem = order.items[order.currentItemIndex];
  const totalItems = order.items.length;
  const currentIndex = order.currentItemIndex;
  const progress = totalItems > 0 ? (currentIndex / totalItems) * 100 : 0;
  const isLast = currentIndex + 1 >= totalItems;

  // If all items are done
  if (!currentItem) {
    return (
      <View style={styles.doneContainer}>
        <View style={styles.doneIcon}>
          <Text style={styles.doneIconText}>✓</Text>
        </View>
        <Text style={styles.doneTitle}>Pedido Finalizado!</Text>
        <Text style={styles.doneSubtitle}>
          Todos os ingredientes foram pesados
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Voltar aos Pedidos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.topBarBack}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          Pedido #{orderId.slice(0, 8)}
        </Text>
        <Text style={styles.topBarCounter}>
          {currentIndex + 1}/{totalItems}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Items overview (compact) */}
      <View style={styles.stepsRow}>
        {order.items.map((item, i) => (
          <View
            key={item.id}
            style={[
              styles.stepDot,
              i < currentIndex && styles.stepDotDone,
              i === currentIndex && styles.stepDotCurrent,
            ]}
          />
        ))}
      </View>

      {/* Main weighing area */}
      <View style={styles.mainArea}>
        <Text style={styles.instructionLabel}>Agora pese:</Text>

        <Text style={styles.ingredientName}>
          {currentItem.ingredientName}
        </Text>

        {currentItem.ingredientCategory && (
          <Text style={styles.category}>
            {currentItem.ingredientCategory}
          </Text>
        )}

        <View style={styles.weightCircle}>
          <Text style={styles.weightValue}>{currentItem.quantityGrams}</Text>
          <Text style={styles.weightUnit}>gramas</Text>
        </View>
      </View>

      {/* Next button — big and easy to tap */}
      <View style={styles.bottomArea}>
        {/* Upcoming ingredient preview */}
        {!isLast && order.items[currentIndex + 1] && (
          <Text style={styles.nextPreview}>
            Próximo: {order.items[currentIndex + 1].ingredientName} —{" "}
            {order.items[currentIndex + 1].quantityGrams}g
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            isLast && styles.finishButton,
            advancing && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={advancing}
          activeOpacity={0.8}
        >
          {advancing ? (
            <ActivityIndicator color={colors.white} size="large" />
          ) : (
            <Text style={styles.nextButtonText}>
              {isLast ? "Finalizar Pedido" : "Próximo Ingrediente →"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  topBarBack: {
    fontSize: 16,
    color: colors.brandRed,
    fontWeight: "600",
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.gray900,
  },
  topBarCounter: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray500,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray200,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.brandOrange,
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gray200,
  },
  stepDotDone: {
    backgroundColor: colors.brandGreen,
  },
  stepDotCurrent: {
    backgroundColor: colors.brandOrange,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  mainArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  instructionLabel: {
    fontSize: 18,
    color: colors.gray500,
    marginBottom: 8,
  },
  ingredientName: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.gray900,
    textAlign: "center",
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: colors.gray400,
    marginBottom: 24,
  },
  weightCircle: {
    width: Math.min(SCREEN_WIDTH * 0.55, 260),
    height: Math.min(SCREEN_WIDTH * 0.55, 260),
    borderRadius: Math.min(SCREEN_WIDTH * 0.55, 260) / 2,
    backgroundColor: colors.brandGreenLight,
    borderWidth: 4,
    borderColor: colors.brandGreen,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  weightValue: {
    fontSize: 72,
    fontWeight: "bold",
    color: colors.brandGreen,
  },
  weightUnit: {
    fontSize: 22,
    color: colors.brandGreenDark,
    fontWeight: "500",
    marginTop: -4,
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  nextPreview: {
    textAlign: "center",
    fontSize: 14,
    color: colors.gray400,
    marginBottom: 12,
  },
  nextButton: {
    backgroundColor: colors.brandRed,
    paddingVertical: 22,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: colors.brandRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  finishButton: {
    backgroundColor: colors.brandGreen,
    shadowColor: colors.brandGreen,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: colors.brandRed,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 14,
    marginTop: 24,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  doneContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 24,
  },
  doneIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.brandGreenLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  doneIconText: {
    fontSize: 48,
    color: colors.brandGreen,
    fontWeight: "bold",
  },
  doneTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.gray900,
    marginBottom: 8,
  },
  doneSubtitle: {
    fontSize: 18,
    color: colors.gray500,
  },
});
