import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { AlertCircle, ExternalLink } from 'lucide-react-native';
import { SPACING } from '../../styles/theme';
import { useAccounts } from '../../context/AccountsContext';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { fetchMeterData } from '../../utils/api';

const AddAccountModal = ({ visible, onClose }) => {
  const { addAccount } = useAccounts();
  const { colors, themeColor } = useTheme();
  
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    if (customerId.length !== 13 || isNaN(customerId)) {
      setError("Invalid Customer ID. Must be 13 digits.");
      setLoading(false);
      return;
    }

    if (!customerName.trim() || customerName.length < 3) {
      setError("Name must be at least 3 characters.");
      setLoading(false);
      return;
    }

    try {
      const data = await fetchMeterData(customerId, true);

      if (!data || !data.isCustomerIdValid) {
        throw new Error("Your CustomerID is Wrong, Please Check Again!");
      }

      const success = await addAccount(customerId, customerName);
      if (!success) {
        throw new Error("Account already exists within local storage.");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCustomerName("");
      setCustomerId("");
      onClose();
    } catch (err) {
      // Displays clean message strings from the worker context rather than a data object dump
      setError(err.message || "Unable to communicate with verification servers.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.card || colors.surface }]}>
          
          {/* Note Banner */}
          <View style={[styles.infoBanner, { backgroundColor: `${colors.error}15` }]}>
            <View style={styles.infoHeader}>
              <View style={styles.row}>
                <AlertCircle color={colors.error} size={16} />
                <Text style={[styles.infoTitle, { color: colors.error }]}>NOTE</Text>
              </View>
              <TouchableOpacity style={[styles.findBtn, { backgroundColor: colors.error }]} onPress={() => Linking.openURL("https://jkmeter.vercel.app/faq")}>
                <Text style={styles.findBtnText}>Find ID</Text>
                <ExternalLink color="#FFF" size={12} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.infoText, { color: colors.error }]}>1. Customer ID is a 13 Digit Number on your Electricity Bill</Text>
            <Text style={[styles.infoText, { color: colors.error }]}>2. Name must contain at least 3 characters</Text>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Customer Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Account Name (e.g., Home)"
            placeholderTextColor={colors.textSecondary}
            value={customerName}
            onChangeText={setCustomerName}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Customer ID</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            keyboardType="numeric"
            placeholder="13 digits"
            placeholderTextColor={colors.textSecondary}
            value={customerId}
            onChangeText={setCustomerId}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { borderColor: colors.border, backgroundColor: colors.background }]} disabled={loading}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleLogin} style={[styles.submitBtn, { backgroundColor: themeColor }]} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Submit</Text>}
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  content: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg },
  infoBanner: { padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.lg },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoTitle: { fontWeight: 'bold' },
  infoText: { fontSize: 13, marginBottom: 4, opacity: 0.9 },
  findBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 4 },
  findBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  label: { fontSize: 13, marginBottom: 8, fontWeight: '600' },
  input: { borderRadius: 12, padding: SPACING.md, fontSize: 16, borderWidth: 1, marginBottom: SPACING.md },
  errorText: { color: '#FF3B30', marginBottom: SPACING.md, fontSize: 14, fontWeight: '500' },
  footer: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  cancelBtn: { flex: 1, padding: SPACING.md, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1 },
  cancelText: { fontWeight: 'bold' },
  submitBtn: { flex: 2, padding: SPACING.md, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  submitText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default AddAccountModal;