import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Trash2, Plus, AlertCircle } from 'lucide-react-native';
import { useAccounts } from '../context/AccountsContext';
import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../styles/theme';
import AddAccountModal from '../components/Modals/AddAccountModal';

// Premium UI colors for deterministic offline backgrounds
const AVATAR_COLORS = [
  '#007AFF', // Blue
  '#34C759', // Green
  '#FF9500', // Orange
  '#AF52DE', // Purple
  '#FF3B30', // Red
  '#5AC8FA', // Teal
  '#FF2D55', // Pink
];

const AccountsScreen = () => {
  const { accounts, currentlySelectedAccount, setCurrentlySelectedAccount, deleteAccount } = useAccounts();
  const { colors } = useTheme(); // Relying purely on the structured palette colors
  const [isModalVisible, setModalVisible] = useState(false);

  // Generates a stable character and color entirely offline from the string name
  const getOfflineAvatar = (name) => {
    const cleanName = name ? name.trim() : '';
    const initial = cleanName.charAt(0).toUpperCase() || '?';
    
    // Simple deterministic string hashing algorithm
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
      hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;
    return {
      initial,
      backgroundColor: AVATAR_COLORS[colorIndex],
    };
  };

  const confirmDelete = (accountNumber) => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete this account? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Delete", style: "destructive", onPress: () => deleteAccount(accountNumber) }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Your Accounts</Text>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)} 
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Plus color={colors.background} size={18} strokeWidth={2.5} />
          <Text style={[styles.addBtnText, { color: colors.background }]}>Add New</Text>
        </TouchableOpacity>
      </View>

      {accounts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AlertCircle color={colors.textSecondary} size={40} style={{ marginBottom: SPACING.sm }} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No accounts added yet.</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Tap "Add New" to get started.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {accounts.map((account) => {
            const isSelected = currentlySelectedAccount?.accountNumber === account.accountNumber;
            const avatar = getOfflineAvatar(account.name);

            return (
              <TouchableOpacity
                key={account.accountNumber}
                style={[
                  styles.accountCard, 
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isSelected && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }
                ]}
                onPress={() => setCurrentlySelectedAccount(account)}
                activeOpacity={0.7}
              >
                {/* 100% Offline Component Based Avatar Replacement */}
                <View style={[styles.avatarContainer, { backgroundColor: avatar.backgroundColor }]}>
                  <Text style={styles.avatarLetter}>{avatar.initial}</Text>
                </View>

                <View style={styles.accountInfo}>
                  <Text style={[styles.accountName, { color: isSelected ? colors.primary : colors.text }]}>
                    {account.name}
                  </Text>
                  <Text style={[styles.accountNumber, { color: colors.textSecondary }]}>
                    {account.accountNumber}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.deleteBtn, { backgroundColor: `${colors.error}15` }]}
                  onPress={() => confirmDelete(account.accountNumber)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 color={colors.error} size={20} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <AddAccountModal visible={isModalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.lg },
  title: { fontSize: 28, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, gap: 6 },
  addBtnText: { fontWeight: 'bold', fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtext: { fontSize: 14 },
  listContainer: { padding: SPACING.md, paddingBottom: 100 },
  
  accountCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: 16, marginBottom: SPACING.sm, borderWidth: 1 },
  
  // Custom Technical Style Offline Avatars
  avatarContainer: { width: 44, height: 44, borderRadius: 44, marginRight: SPACING.md, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  avatarLetter: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  
  accountInfo: { flex: 1 },
  accountName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  accountNumber: { fontSize: 14 },
  deleteBtn: { padding: 8, borderRadius: 12 }
});

export default AccountsScreen;