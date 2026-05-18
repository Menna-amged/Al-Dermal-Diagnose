import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const categories = [
  'AI Accuracy',
  'UI / Design',
  'Performance',
  'Doctor Chat',
  'Reports',
  'Other',
];

const MAX_CHARS = 300;

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const [rating, setRating] = useState(4);
  const [selectedCategory, setSelectedCategory] = useState('AI Accuracy');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert('Missing Message', 'Please write a short feedback message before submitting.');
      return;
    }
    // TODO: connect to your backend API here
    setSubmitted(true);
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Share Your Thoughts 💬</Text>
          <Text style={styles.heroSub}>
            Help us improve DermAI. Your feedback shapes our next update.
          </Text>
        </View>

        {/* Star Rating */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Overall Experience</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabelText}>Poor</Text>
            <Text style={styles.ratingLabelText}>Excellent</Text>
          </View>
        </View>

        {/* Category */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, selectedCategory === cat && styles.catBtnSelected]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.75}
              >
                <Text
                  style={[styles.catBtnText, selectedCategory === cat && styles.catBtnTextSelected]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Your Message</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us what you think..."
            placeholderTextColor="#AEAEB2"
            multiline
            numberOfLines={4}
            maxLength={MAX_CHARS}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {message.length} / {MAX_CHARS}
          </Text>
        </View>

        {/* Anonymous Toggle */}
        <View style={styles.anonymousRow}>
          <View style={styles.anonymousTextWrap}>
            <Text style={styles.anonymousTitle}>Submit Anonymously</Text>
            <Text style={styles.anonymousSub}>Your name won't be attached</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, submitted && styles.submitBtnDone]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={submitted}
        >
          <Text style={styles.submitBtnText}>
            {submitted ? '✓  Sent! Thank you' : 'Send Feedback'}
          </Text>
        </TouchableOpacity>

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
  heroCard: {
    backgroundColor: '#1a3ed4',
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  star: {
    fontSize: 30,
    color: '#E5E5EA',
  },
  starActive: {
    color: '#FFCC00',
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingLabelText: {
    fontSize: 11,
    color: '#AEAEB2',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catBtn: {
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  catBtnSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E8EDFF',
  },
  catBtnText: {
    fontSize: 13,
    color: '#555',
  },
  catBtnTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#FAFAFA',
    minHeight: 100,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 11,
    color: '#AEAEB2',
    textAlign: 'right',
    marginTop: 6,
  },
  anonymousRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  anonymousTextWrap: {
    flex: 1,
  },
  anonymousTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  anonymousSub: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitBtnDone: {
    backgroundColor: '#34C759',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.2,
  },
  bottomPadding: {
    height: 32,
  },
});
