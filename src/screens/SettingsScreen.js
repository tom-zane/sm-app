import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking, ToastAndroid, Alert, ScrollView } from 'react-native';
import { Heart, Mail, Database, Check } from 'lucide-react-native';
import { SPACING } from '../styles/theme';
import { useTheme } from '../context/ThemeContext';
import { THEMES } from '../styles/theme'; // Reading themes directly from source of truth
import { clearApiCache } from '../utils/storage';

const SettingsScreen = () => {
  const { themeName, changeTheme, isDark, toggleDarkMode, colors } = useTheme();
  const upiUrl = "upi://pay?pa=arubk744-6@oksbi&pn=Aryan%20Sharma&aid=uGICAgICgpa-8Sg";

  const handleClearCache = async () => {
    const success = await clearApiCache();
    if (success) {    
      Alert.alert("Success", "Server cache cleared successfully.");      
    } else {
      Alert.alert("Error", "Failed to clear cache.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Appearance Configuration Card */}
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

          <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Theme Preset</Text>
          
          {/* Dynamic Grid Layout reading from THEMES source object */}
          <View style={styles.themeGrid}>
            {Object.keys(THEMES).map((key) => {
              const theme = THEMES[key];
              const isSelected = themeName === key;
              
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => changeTheme(key)}
                  activeOpacity={0.8}
                  style={[
                    styles.themeCard,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    isSelected && { borderColor: colors.primary, borderWidth: 2 }
                  ]}
                >
                  {/* Custom Split Pill Container Shape: { Light Color | Dark Color } */}
                  <View style={styles.splitIndicator}>
                    <View style={[styles.splitHalfLeft, { backgroundColor: theme.light.primary }]} />
                    <View style={[styles.splitHalfRight, { backgroundColor: theme.dark.primary }]} />
                    
                    {/* Centered Check Badge Layer when chosen */}
                    {isSelected && (
                      <View style={[styles.checkCircle, { backgroundColor: colors.text }]}>
                        <Check color={colors.background} size={10} strokeWidth={4} />
                      </View>
                    )}
                  </View>
                  
                  {/* Theme Identification Typography */}
                  <Text style={[styles.themeLabelText, { color: isSelected ? colors.primary : colors.text }]}>
                    {theme.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Donation Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Heart color={colors.primary} size={20} />
            <Text style={[styles.cardTitle, { color: colors.primary, marginBottom: 0 }]}>Support the Project</Text>
          </View>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            If you find this app helpful, consider making a small donation to keep the servers running!
          </Text>

          <TouchableOpacity style={[styles.donateBtn, { backgroundColor: colors.primary }]} onPress={() => Linking.openURL(upiUrl)}>
            <Text style={[styles.donateBtnText, { color: colors.background }]}>Donate via UPI App</Text>
          </TouchableOpacity>
        </View>

        {/* Debug Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Database color={colors.textSecondary} size={20} />
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>Developer Settings</Text>
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

        {/* Support Link */}
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
  header: { padding: SPACING.md, paddingTop: SPACING.lg, borderBottomWidth: 1 },
  title: { fontSize: 28, fontWeight: 'bold' },
  content: { padding: SPACING.md, paddingBottom: SPACING.xl * 2 },
  
  card: { borderRadius: 16, padding: SPACING.lg, borderWidth: 1, marginBottom: SPACING.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: SPACING.md },
  
  tabContainer: { flexDirection: 'row', padding: 4, borderRadius: 12, borderWidth: 1, marginBottom: SPACING.md },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTab: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  tabText: { fontWeight: '600', fontSize: 14 },

  subLabel: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.md, letterSpacing: 0.5 },
  
  // Renders theme choices side-by-side inside a modular wrap-grid layout
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  themeCard: { width: '31%', padding: SPACING.sm, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  
  // Shape Layout: { Light Color | Dark Color } Dynamic Preview Pill
  splitIndicator: { width: '100%', height: 32, borderRadius: 6, flexDirection: 'row', overflow: 'hidden', marginBottom: 8, position: 'relative' },
  splitHalfLeft: { flex: 1 },
  splitHalfRight: { flex: 1 },
  
  // Precise floating absolute layer layout for verification indicator check circles
  checkCircle: { position: 'absolute', width: 16, height: 16, borderRadius: 8, top: 8, left: '50%', marginLeft: -8, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  themeLabelText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },

  description: { fontSize: 14, lineHeight: 20, marginBottom: SPACING.lg },
  donateBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  donateBtnText: { fontWeight: 'bold', fontSize: 16 },

  debugBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  debugBtnText: { fontWeight: 'bold', fontSize: 15 },
  
  emailContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: SPACING.sm },
  emailText: { fontSize: 14, fontWeight: '500' }
});

export default SettingsScreen;