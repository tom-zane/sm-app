import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking, Platform, ToastAndroid, Alert, ScrollView } from 'react-native';
import { Heart, Mail, Database } from 'lucide-react-native';
import { SPACING , COLORS} from '../styles/theme';
import { useTheme } from '../context/ThemeContext';
import { clearApiCache } from '../utils/storage';

const THEME_OPTIONS = [
  '#FF453A', '#0A84FF', '#30D158', '#FF9F0A', '#a270ff', '#8E8E93'
];

const SettingsScreen = () => {
  const { themeColor, changeThemeColor, isDark, toggleDarkMode, colors } = useTheme();
  const upiUrl = "upi://pay?pa=arubk744-6@oksbi&pn=Aryan%20Sharma&aid=uGICAgICgpa-8Sg";

  const handleClearCache = async () => {
    const success = await clearApiCache();
    if (success) {
      if (Platform.OS === 'android') {
        ToastAndroid.show("Server cache cleared successfully", ToastAndroid.SHORT);
      } else {
        Alert.alert("Success", "Server cache cleared successfully.");
      }
    } else {
      Alert.alert("Error", "Failed to clear cache.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Theme Selector */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Appearance</Text>
          
          {/* Light/Dark Toggle Tabs */}
          <View style={[styles.tabContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TouchableOpacity 
              onPress={() => toggleDarkMode(false)} 
              style={[styles.tab, !isDark && [styles.activeTab, { backgroundColor: colors.surface }]]}
            >
              <Text style={[styles.tabText, { color: !isDark ? colors.text : colors.textSecondary }]}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => toggleDarkMode(true)} 
              style={[styles.tab, isDark && [styles.activeTab, { backgroundColor: colors.surface }]]}
            >
              <Text style={[styles.tabText, { color: isDark ? colors.text : colors.textSecondary }]}>Dark</Text>
            </TouchableOpacity>
          </View>

          {/* Square Color Cards */}
          <View style={styles.colorGrid}>
            {THEME_OPTIONS.map(color => (
              <TouchableOpacity
                key={color}
                onPress={() => changeThemeColor(color)}
                style={[
                  styles.colorSquare,
                  { backgroundColor: color },
                  themeColor === color && { borderWidth: 3, borderColor: colors.text }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Donation Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Heart color={themeColor} size={20} />
            <Text style={[styles.cardTitle, { color: themeColor, marginBottom: 0 }]}>Support the Project</Text>
          </View>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            If you find this app helpful, consider making a small donation to keep the servers running!
          </Text>

          {(Platform.OS === 'android' || Platform.OS === 'ios') && (
            <TouchableOpacity style={[styles.donateBtn, { backgroundColor: themeColor }]} onPress={() => Linking.openURL(upiUrl)}>
              <Text style={styles.donateBtnText}>Donate via UPI App</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Debug Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Database color={colors.textSecondary} size={20} />
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>Developer</Text>
          </View>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Experiencing data sync issues? Clear the local API cache to force a fresh pull from the server.
          </Text>
          <TouchableOpacity 
            style={[styles.debugBtn, { backgroundColor: `${colors.error}15`, borderColor: `${colors.error}30` }]} 
            onPress={handleClearCache}
          >
            <Text style={[styles.debugBtnText, { color: colors.error }]}>Clear Server Cache</Text>
          </TouchableOpacity>
        </View>

        {/* Support Email */}
        <TouchableOpacity style={styles.emailContainer} onPress={() => Linking.openURL('mailto:arubk744@gmail.com')}>
          <Mail color={colors.textSecondary} size={16} />
          <Text style={[styles.emailText, { color: colors.textSecondary }]}>Need help? arubk744@gmail.com</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: SPACING.md, paddingTop: SPACING.lg ,backgroundColor: COLORS.surface },
  title: { fontSize: 28, fontWeight: 'bold' },
  content: { padding: SPACING.md, paddingBottom: SPACING.xl * 2 }, // Added extra bottom padding for safety
  
  card: { borderRadius: 16, padding: SPACING.lg, borderWidth: 1, marginBottom: SPACING.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: SPACING.md },
  
  tabContainer: { flexDirection: 'row', padding: 4, borderRadius: 12, borderWidth: 1, marginBottom: SPACING.lg },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTab: { elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  tabText: { fontWeight: '600', fontSize: 14 },

  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  colorSquare: { width: 48, height: 48, borderRadius: 12, elevation: 2 },

  description: { fontSize: 14, lineHeight: 20, marginBottom: SPACING.lg },
  donateBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  donateBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

  debugBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  debugBtnText: { fontWeight: 'bold', fontSize: 15 },
  
  emailContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: SPACING.sm },
  emailText: { fontSize: 14, fontWeight: '500' }
});

export default SettingsScreen;