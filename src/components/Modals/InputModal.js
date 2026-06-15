import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SPACING } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';

const InputModal = ({ visible, onClose, onSubmit, title, placeholder, initialValue = '' }) => {
  const { colors } = useTheme(); // Hook into your dynamic color palette matrix
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (visible) {
      setInputValue(initialValue ? String(initialValue) : '');
    }
  }, [visible, initialValue]);

  const handleSubmit = () => {
    if (!inputValue) return;
    onSubmit(inputValue);
    setInputValue('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }
            ]}
            keyboardType="decimal-pad"
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            value={inputValue}
            onChangeText={setInputValue}
            autoFocus
          />

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleSubmit} 
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.submitText, { color: colors.background }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  content: { borderRadius: 20, padding: SPACING.lg, width: '100%', maxWidth: 400 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: SPACING.md, textAlign: 'center' },
  input: { borderRadius: 12, padding: SPACING.md, fontSize: 24, textAlign: 'center', borderWidth: 1 },
  footer: { flexDirection: 'row', marginTop: SPACING.lg, gap: SPACING.md },
  cancelBtn: { flex: 1, padding: SPACING.md, alignItems: 'center' },
  cancelText: { fontWeight: '500' },
  submitBtn: { flex: 2, padding: SPACING.md, alignItems: 'center', borderRadius: 12 },
  submitText: { fontWeight: 'bold' }
});

export default InputModal;