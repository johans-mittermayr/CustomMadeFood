import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api, Order } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { colors } from "../theme/colors";
import type { RootStackParamList } from "../../App";

const POLL_INTERVAL = 5000;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  preparing: "Preparando",
  weighing: "Pesando",
  ready: "Pronto",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: colors.yellow100, text: colors.yellow700 },
  accepted: { bg: colors.brandGreenLight, text: colors.brandGreen },
  preparing: { bg: colors.brandOrangeLight, text: colors.brandOrange },
  weighing: { bg: colors.purple100, text: colors.purple600 },
  ready: { bg: colors.brandGreenLight, text: colors.brandGreenDark },
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Orders">;

export function OrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.getKitchenOrders();
      setOrders(data);
    } catch {
      // Silently fail on poll
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Refetch when navigating back from weighing screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchOrders();
    });
    return unsubscribe;
  }, [navigation, fetchOrders]);

  async function handleAccept(orderId: string) {
    await api.acceptOrder(orderId);
    fetchOrders();
  }

  async function handleStartWeighing(orderId: string) {
    await api.startWeighing(orderId);
    await fetchOrders();
    navigation.navigate("Weighing", { orderId });
  }

  function handleOpenWeighing(order: Order) {
    navigation.navigate("Weighing", { orderId: order.id });
  }

  function onRefresh() {
    setRefreshing(true);
    fetchOrders();
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brandRed} />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </View>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const activeOrders = orders.filter((o) =>
    ["accepted", "preparing", "weighing"].includes(o.status)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>Cozinha</Text>
            <Text style={styles.headerSubtitle}>{user?.name}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Auto-refresh indicator */}
      <View style={styles.pollBanner}>
        <View style={styles.pollDot} />
        <Text style={styles.pollText}>
          Atualiza a cada {POLL_INTERVAL / 1000}s
        </Text>
      </View>

      <FlatList
        data={[...pendingOrders, ...activeOrders]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.brandRed]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nenhum pedido no momento</Text>
            <Text style={styles.emptySubtitle}>
              Novos pedidos aparecerão aqui automaticamente
            </Text>
          </View>
        }
        ListHeaderComponent={
          <>
            {pendingOrders.length > 0 && (
              <Text style={styles.sectionTitle}>
                Pendentes ({pendingOrders.length})
              </Text>
            )}
          </>
        }
        renderItem={({ item, index }) => {
          // Insert section header for active orders
          const showActiveHeader =
            index === pendingOrders.length && activeOrders.length > 0;

          const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
          const isWeighing = item.status === "weighing";
          const progress =
            item.items.length > 0
              ? (item.currentItemIndex / item.items.length) * 100
              : 0;

          return (
            <>
              {showActiveHeader && (
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                  Ativos ({activeOrders.length})
                </Text>
              )}
              <View
                style={[
                  styles.card,
                  isWeighing && styles.cardWeighing,
                ]}
              >
                {/* Card header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId}>
                    Pedido #{item.id.slice(0, 8)}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: statusStyle.bg },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                      {STATUS_LABELS[item.status] || item.status}
                    </Text>
                  </View>
                </View>

                {/* Progress bar for active orders */}
                {["accepted", "preparing", "weighing"].includes(item.status) && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[styles.progressFill, { width: `${progress}%` }]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {item.currentItemIndex}/{item.items.length}
                    </Text>
                  </View>
                )}

                {/* Items list */}
                <View style={styles.itemsList}>
                  {item.items.map((orderItem, i) => (
                    <View key={orderItem.id} style={styles.itemRow}>
                      <View
                        style={[
                          styles.itemDot,
                          i < item.currentItemIndex && styles.itemDotDone,
                        ]}
                      />
                      <Text
                        style={[
                          styles.itemName,
                          i < item.currentItemIndex && styles.itemDone,
                        ]}
                      >
                        {orderItem.ingredientName}
                      </Text>
                      <Text
                        style={[
                          styles.itemGrams,
                          i < item.currentItemIndex && styles.itemDone,
                        ]}
                      >
                        {orderItem.quantityGrams}g
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Time */}
                <Text style={styles.time}>
                  {new Date(item.createdAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>

                {/* Action buttons */}
                {item.status === "pending" && (
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAccept(item.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.acceptButtonText}>Aceitar Pedido</Text>
                  </TouchableOpacity>
                )}

                {item.status === "accepted" && (
                  <TouchableOpacity
                    style={styles.weighButton}
                    onPress={() => handleStartWeighing(item.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.weighButtonText}>Iniciar Pesagem</Text>
                  </TouchableOpacity>
                )}

                {item.status === "weighing" && (
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => handleOpenWeighing(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.continueButtonText}>
                      Continuar Pesagem
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.gray500,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.gray900,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.gray500,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  logoutText: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: "500",
  },
  pollBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: colors.brandGreenLight,
    gap: 6,
  },
  pollDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandGreen,
  },
  pollText: {
    fontSize: 12,
    color: colors.brandGreen,
    fontWeight: "500",
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.gray700,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardWeighing: {
    borderColor: colors.brandOrange,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.gray900,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.brandOrange,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray500,
    fontWeight: "500",
  },
  itemsList: {
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    gap: 8,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray300,
  },
  itemDotDone: {
    backgroundColor: colors.brandGreen,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: colors.gray700,
  },
  itemGrams: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray900,
  },
  itemDone: {
    color: colors.gray400,
    textDecorationLine: "line-through",
  },
  time: {
    fontSize: 12,
    color: colors.gray400,
    marginBottom: 12,
  },
  acceptButton: {
    backgroundColor: colors.brandGreen,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  acceptButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  weighButton: {
    backgroundColor: colors.brandOrange,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  weighButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: colors.brandRed,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    color: colors.gray400,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray400,
    marginTop: 8,
  },
});
