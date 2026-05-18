import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const appInfo = [
  { label: 'Version', value: '1.0.0' },
  { label: 'Build', value: '2026.04.15' },
  { label: 'Platform', value: 'React Native' },
  { label: 'AI Model', value: 'ConvNeXt', highlight: true },
  { label: 'University', value: 'BNU' },
];

const teamMembers = [
  { name: 'Backend Team', role: 'API & Auth' },
  { name: 'ML/AI Team', role: 'ConvNeXt' },
  { name: 'Mobile Team', role: 'React Native' },
  { name: 'Dr. Ola Khedr', role: 'Supervisor' },
];

export default function AboutScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>🔬</Text>
          </View>
          <Text style={styles.appName}>dermaCam</Text>
          <Text style={styles.appTagline}>
            AI-powered skin disease diagnosis{'\n'}at your fingertips
          </Text>
          <View style={styles.versionPill}>
            <Text style={styles.versionPillText}>Version 1.0.0</Text>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.card}>
          {appInfo.map((item, index) => (
            <View
              key={index}
              style={[styles.infoRow, index < appInfo.length - 1 && styles.infoRowBorder]}
            >
              <Text style={styles.infoLabel}>{item.label}</Text>
              {item.highlight ? (
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>{item.value}</Text>
                </View>
              ) : (
                <Text style={styles.infoValue}>{item.value}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Team */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Graduation Project Team</Text>
          <View style={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <View key={index} style={styles.teamMember}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerCard}>
          <Text style={styles.footerText}>
            Made with{' '}
            <Text style={styles.heart}>♥</Text>
            {' '}by <Text style={styles.footerBold}>BNU CS Faculty</Text> · 2026
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
  },
  backBtn: {
    padding: 4,
  },
  backArrow: {
    fontSize: 28,
    color: '#007AFF',
    lineHeight: 30,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 28,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  hero: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#1a3ed4',
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoEmoji: {
    fontSize: 32,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  appTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
  },
  versionPill: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  versionPillText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
  },
  infoRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F5',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6E6E73',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  aiBadge: {
    backgroundColor: '#E8EDFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  aiBadgeText: {
    fontSize: 13,
    color: '#2855D8',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  teamMember: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 10,
    width: '48%',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  memberRole: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  footerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
  heart: {
    color: '#E74C3C',
  },
  footerBold: {
    color: '#000',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 32,
  },
});
