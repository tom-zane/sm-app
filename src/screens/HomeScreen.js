import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, ActivityIndicator, RefreshControl, 
  Linking, ToastAndroid, FlatList
} from 'react-native';
import { RefreshCw, AlertCircle, ExternalLink } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { useAccounts } from '../context/AccountsContext';
import { useTheme } from '../context/ThemeContext';
import { fetchMeterData } from '../utils/api';
import { SPACING } from '../styles/theme';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { currentlySelectedAccount, accounts } = useAccounts();
  const { themeColor, colors } = useTheme(); 
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [visibleMonth, setVisibleMonth] = useState("");

  const loadData = useCallback(async (forceRefresh = false) => {
    if (!currentlySelectedAccount) return;
    
    forceRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    
    try {
      const result = await fetchMeterData(currentlySelectedAccount.accountNumber, forceRefresh);
      setData(result);
      
      if (result?.readings?.length > 0) {
        updateVisibleMonth(result.readings[0].fullDate);
      }
    } catch (err) {
      setError("Failed to load meter data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentlySelectedAccount]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePayBill = async () => {
    if (currentlySelectedAccount?.accountNumber) {
      await Clipboard.setStringAsync(currentlySelectedAccount.accountNumber);
      ToastAndroid.show("Customer ID copied, paste and pay bill", ToastAndroid.LONG);
    }
    Linking.openURL("https://wss.jpdcl.co.in/quick-pay").catch((err) => 
      console.error("Failed to open URL:", err)
    );
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d)) return dateString; 
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('default', { month: 'short' });
    const year = String(d.getFullYear()).slice(-2);
    
    return `${day}-${month}-${year}`;
  };

  const updateVisibleMonth = (dateString) => {
    const d = new Date(dateString);
    if (!isNaN(d)) {
      setVisibleMonth(d.toLocaleString('default', { month: 'long', year: 'numeric' }));
    }
  };

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const topItem = viewableItems[0].item;
      updateVisibleMonth(topItem.fullDate);
    }
  }).current;

  // --- No Account State ---
  if (!currentlySelectedAccount && accounts.length === 0) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <AlertCircle color={colors.textSecondary} size={48} style={{ marginBottom: SPACING.md }} />
        <Text style={[styles.emptyText, { color: colors.text }]}>No Account Selected</Text>
        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Add an account to view your smart meter data.</Text>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: themeColor }]} onPress={() => navigation.navigate('Accounts')}>
          <Text style={styles.primaryBtnText}>Go to Accounts</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderDailyRow = ({ item, index }) => {
    const isEven = index % 2 === 0;
    return (
      <TouchableOpacity 
        activeOpacity={0.6}
        onPress={() => Haptics.selectionAsync()}
        style={[
          styles.tableRow, 
          { backgroundColor: isEven ? colors.background : colors.surface }
        ]}
      >
        <Text style={[styles.tableCellText, { color: colors.text, flex: 2 }]}>{formatDate(item.fullDate)}</Text>
        <Text style={[styles.tableCellText, { color: colors.text, flex: 1.5 }]}>{item.units}</Text>
        <Text style={[styles.tableCellText, styles.consumptionText, { flex: 1.5, textAlign: 'right' }]}>
          +{item.dailyConsumption !== null ? item.dailyConsumption : "N/A"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      <View>
        {/* Header Card */}
        <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.headerInfo}>
            <Text style={[styles.accountName, { color: colors.text }]}>{currentlySelectedAccount?.name}</Text>
            <Text style={[styles.accountNumber, { color: colors.textSecondary }]}>{currentlySelectedAccount?.accountNumber}</Text>
            
            <TouchableOpacity 
              style={[styles.payBillInlineBtn, { backgroundColor: `${themeColor}15`, borderColor: `${themeColor}30` }]} 
              onPress={handlePayBill}
            >
              <Text style={[styles.payBillInlineText, { color: themeColor }]}>Pay Bill Online</Text>
              <ExternalLink color={themeColor} size={14} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[styles.refreshBtn, { backgroundColor: colors.background, borderColor: colors.border }]} 
            onPress={() => loadData(true)}
            disabled={loading || refreshing}
          >
            {loading || refreshing ? (
              <ActivityIndicator color={themeColor} size="small" />
            ) : (
              <RefreshCw color={themeColor} size={20} />
            )}
          </TouchableOpacity>
        </View>

        {error && <View style={[styles.errorContainer, { backgroundColor: `${colors.error}15` }]}><Text style={[styles.errorText, { color: colors.error }]}>{error}</Text></View>}

        {/* Monthly Usage */}
        {data?.monthlyUsage && data.monthlyUsage.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Usage</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthlyScroll}>
              {data.monthlyUsage.map((usage, index) => (
                <View key={index} style={[styles.monthlyCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.monthText, { color: colors.text }]}>{usage.month}</Text>
                  <Text style={styles.billText}>₹{usage.estimatedBill?.toFixed(0) || 0}</Text>
                  <Text style={[styles.unitsText, { color: colors.textSecondary }]}>Units: {usage.unitsConsumed}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Daily List */}
      {loading && !data && !refreshing ? (
        <ActivityIndicator color={themeColor} size="large" style={{ marginTop: 40 }} />
      ) : (
        data?.readings && data.readings.length > 0 && (
          <View style={[styles.dailyUsageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.dailyUsageTitleRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Usage</Text>
              <View style={[styles.visibleMonthBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.visibleMonthText, { color: themeColor }]}>{visibleMonth}</Text>
              </View>
            </View>
            
            <View style={[styles.tableHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
              <Text style={[styles.tableHeaderText, { color: colors.textSecondary, flex: 2 }]}>Date</Text>
              <Text style={[styles.tableHeaderText, { color: colors.textSecondary, flex: 1.5 }]}>Units</Text>
              <Text style={[styles.tableHeaderText, { color: colors.textSecondary, flex: 1.5, textAlign: 'right' }]}>Consumed</Text>
            </View>

            <FlatList
              data={data.readings}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              renderItem={renderDailyRow}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: SPACING.xl }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={themeColor} />
              }
            />
          </View>
        )
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  
  emptyText: { fontSize: 20, fontWeight: 'bold', marginBottom: SPACING.xs },
  emptySubtext: { fontSize: 14, textAlign: 'center', marginBottom: SPACING.lg },
  primaryBtn: { paddingHorizontal: SPACING.xl, paddingVertical: 14, borderRadius: 12 },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  headerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', margin: SPACING.md, padding: SPACING.lg, borderRadius: 16, borderWidth: 1 },
  headerInfo: { flex: 1 },
  accountName: { fontSize: 22, fontWeight: 'bold' },
  accountNumber: { fontSize: 15, marginTop: 4 },
  
  payBillInlineBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginTop: 12, gap: 6, borderWidth: 1 },
  payBillInlineText: { fontWeight: 'bold', fontSize: 13 },
  
  refreshBtn: { padding: 12, borderRadius: 12, borderWidth: 1 },
  errorContainer: { marginHorizontal: SPACING.md, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md },
  errorText: { textAlign: 'center', fontWeight: '500' },

  section: { marginHorizontal: SPACING.md, marginBottom: SPACING.lg, borderRadius: 16, padding: SPACING.md, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  
  monthlyScroll: { paddingRight: SPACING.md, gap: SPACING.sm, marginTop: SPACING.md },
  monthlyCard: { padding: SPACING.sm, borderRadius: 10, borderWidth: 1, minWidth: 90, alignItems: 'center' },
  monthText: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  billText: { color: '#00D084', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  unitsText: { fontSize: 11 },

  dailyUsageContainer: { flex: 1, marginHorizontal: SPACING.md, marginBottom: SPACING.md, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  dailyUsageTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md },
  visibleMonthBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  visibleMonthText: { fontSize: 13, fontWeight: 'bold' },

  tableHeader: { flexDirection: 'row', padding: SPACING.sm, borderBottomWidth: 1 },
  tableHeaderText: { fontSize: 14, fontWeight: '600', paddingHorizontal: SPACING.sm },
  tableRow: { flexDirection: 'row', padding: SPACING.md },
  tableCellText: { fontSize: 15, fontWeight: '500' },
  consumptionText: { color: '#00D084', fontWeight: 'bold' },
});

export default HomeScreen;