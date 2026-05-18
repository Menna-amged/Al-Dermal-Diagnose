import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

type MessageType = 'bot' | 'user';

interface DiagnosisResult {
  label: string;
  confidence: number;
}

interface Message {
  id: string;
  type: MessageType;
  text?: string;
  imageUri?: string;
  results?: DiagnosisResult[];
  time: string;
}

const getTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const uid = () => Math.random().toString(36).slice(2);

function ConfidenceBar({ label, value }: { label: string; value: number }) {
  const isPrimary = value > 50;
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <View style={styles.barWrap}>
        <View style={styles.barTrack}>
          <View style={[styles.bar, { flex: value }, !isPrimary && styles.barSecondary]} />
          <View style={{ flex: 100 - value }} />
        </View>
      </View>
      <Text style={[styles.resultPct, !isPrimary && styles.resultPctSecondary]}>
        {value}%
      </Text>
    </View>
  );
}

function ResultCard({ results }: { results: DiagnosisResult[] }) {
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultIcon}>🔍</Text>
        <Text style={styles.resultTitle}>Analysis Result</Text>
      </View>
      {results.map((r, i) => (
        <ConfidenceBar key={i} label={r.label} value={r.confidence} />
      ))}
      <TouchableOpacity style={styles.resultAction}>
        <Text style={styles.resultActionText}>View Full Report →</Text>
      </TouchableOpacity>
    </View>
  );
}

function TypingIndicator() {
  return (
    <View style={[styles.msgBot, { marginTop: 4 }]}>
      <View style={styles.miniAvatar}>
        <Text style={styles.miniAvatarText}>🤖</Text>
      </View>
      <View style={[styles.bubbleBot, styles.typingBubble]}>
        <ActivityIndicator size="small" color="#C7C7CC" />
      </View>
    </View>
  );
}

function BotMessage({ msg }: { msg: Message }) {
  return (
    <View style={styles.msgBot}>
      <View style={styles.miniAvatar}>
        <Text style={styles.miniAvatarText}>🤖</Text>
      </View>
      <View>
        {msg.results ? (
          <ResultCard results={msg.results} />
        ) : (
          <View style={styles.bubbleBot}>
            <Text style={styles.bubbleBotText}>{msg.text}</Text>
            <Text style={styles.timeBot}>{msg.time}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function UserMessage({ msg }: { msg: Message }) {
  return (
    <View style={styles.msgUser}>
      {msg.imageUri ? (
        <View style={styles.imgBubble}>
          <Image source={{ uri: msg.imageUri }} style={styles.imgPreview} resizeMode="cover" />
          {msg.text ? <Text style={styles.imgCaption}>{msg.text}</Text> : null}
          <Text style={styles.timeUser}>{msg.time} ✓✓</Text>
        </View>
      ) : (
        <View style={styles.bubbleUser}>
          <Text style={styles.bubbleUserText}>{msg.text}</Text>
          <Text style={styles.timeUser}>{msg.time} ✓✓</Text>
        </View>
      )}
    </View>
  );
}

export default function ChatbotScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const userName: string = route.params?.userName ?? 'there';
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setIsTyping(true), 400);
    const t2 = setTimeout(() => {
      setIsTyping(false);
      setMessages([{
        id: 'welcome-1', type: 'bot',
        text: `Hi ${userName}! 👋 I'm your DermAI Assistant. I can help you analyze skin conditions, answer questions, or connect you with a doctor.`,
        time: getTime(),
      }]);
    }, 1600);
    const t3 = setTimeout(() => setIsTyping(true), 2400);
    const t4 = setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: 'welcome-2', type: 'bot',
        text: "You can send me a photo of your skin and I'll analyze it instantly using our ConvNeXt  model 🔬",
        time: getTime(),
      }]);
    }, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [userName]);

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const addMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg]);
    scrollToBottom();
  }, []);

  const simulateBotReply = useCallback((userText: string) => {
    setIsTyping(true);
    scrollToBottom();
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ id: uid(), type: 'bot', text: getBotReply(userText), time: getTime() });
    }, 1400);
  }, [addMessage]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    addMessage({ id: uid(), type: 'user', text, time: getTime() });
    setInputText('');
    simulateBotReply(text);
  };

  const handleAttach = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      addMessage({ id: uid(), type: 'user', imageUri: uri, text: 'Please analyze this.', time: getTime() });
      setIsTyping(true);
      scrollToBottom();
      setTimeout(() => {
        setIsTyping(false);
        addMessage({
          id: uid(), type: 'bot',
          results: [
            { label: 'Eczema', confidence: 87 },
            { label: 'Psoriasis', confidence: 9 },
            { label: 'Other', confidence: 4 },
          ],
          time: getTime(),
        });
        scrollToBottom();
        setTimeout(() => {
          addMessage({ id: uid(), type: 'bot', text: 'Based on the analysis, I recommend consulting a dermatologist. Would you like me to find one near you? 🏥', time: getTime() });
        }, 600);
      }, 2000);
    }
  };

  const renderItem = ({ item }: { item: Message }) =>
    item.type === 'bot' ? <BotMessage msg={item} /> : <UserMessage msg={item} />;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1a3ed4" translucent={false} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🤖</Text>
        </View>
        <View style={styles.botInfo}>
          <Text style={styles.botName}>DermAI Assistant</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>Online · Powered by AI</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuDropdown, { top: insets.top + 70 }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); setMessages([]); setIsTyping(false); setInputText(''); }}>
              <Text style={styles.menuItemIcon}>✏️</Text>
              <Text style={styles.menuItemText}>New Chat</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); setMessages([]); }}>
              <Text style={styles.menuItemIcon}>🗑️</Text>
              <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>Delete Chat</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Messages + Input */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesList}
          ListHeaderComponent={<Text style={styles.dateDivider}>Today</Text>}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />

        <View style={[styles.inputBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
          <TouchableOpacity style={styles.attachBtn} onPress={handleAttach}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.inputField}
            placeholder="Ask me anything..."
            placeholderTextColor="#AEAEB2"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline={false}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.85}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function getBotReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('eczema')) return 'Eczema is a chronic skin condition causing inflammation and itching. It can be managed with moisturizers and topical treatments. Would you like more details? 🧴';
  if (t.includes('doctor')) return 'I can help you find a nearby dermatologist. Head to the Doctor tab or I can connect you directly. 🏥';
  if (t.includes('scan') || t.includes('photo')) return "Please tap the 📎 button to attach a skin photo and I'll analyze it instantly!";
  if (t.includes('history')) return 'Your diagnosis history is available in the History tab. You can view past results and reports there 📋';
  return "That's a great question! I'm here to help with any skin-related concerns. Could you provide more details? 🩺";
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1, backgroundColor: '#F2F2F7' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingBottom: 12, gap: 10,
    backgroundColor: '#1a3ed4',
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 28, color: '#fff', lineHeight: 30 },
  botAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  botAvatarText: { fontSize: 20 },
  botInfo: { flex: 1 },
  botName: { fontSize: 15, fontWeight: '600', color: '#fff' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759' },
  statusText: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  menuBtn: { padding: 4 },
  menuIcon: { fontSize: 20, color: 'rgba(255,255,255,0.8)' },

  menuOverlay: { flex: 1 },
  menuDropdown: {
    position: 'absolute', right: 14,
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 4,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 8, minWidth: 160,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 10 },
  menuItemIcon: { fontSize: 16 },
  menuItemText: { fontSize: 15, fontWeight: '500', color: '#111' },
  menuDivider: { height: 1, backgroundColor: '#F2F2F7' },

  messagesList: { paddingHorizontal: 12, paddingVertical: 14, gap: 12, flexGrow: 1 },
  dateDivider: { textAlign: 'center', fontSize: 11, color: '#AEAEB2', marginBottom: 8 },

  msgBot: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1a3ed4', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  miniAvatarText: { fontSize: 14 },
  bubbleBot: {
    backgroundColor: '#fff', borderRadius: 18, borderBottomLeftRadius: 4,
    padding: 10, maxWidth: 220,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  bubbleBotText: { fontSize: 13, color: '#000', lineHeight: 20 },
  timeBot: { fontSize: 10, color: '#AEAEB2', marginTop: 4 },
  typingBubble: { paddingVertical: 12, paddingHorizontal: 16 },

  msgUser: { alignItems: 'flex-end' },
  bubbleUser: { backgroundColor: '#1a3ed4', borderRadius: 18, borderBottomRightRadius: 4, padding: 10, maxWidth: 220 },
  bubbleUserText: { fontSize: 13, color: '#fff', lineHeight: 20 },
  timeUser: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4, textAlign: 'right' },

  imgBubble: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', maxWidth: 200, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  imgPreview: { width: 200, height: 130 },
  imgCaption: { fontSize: 12, color: '#555', padding: 8 },

  resultCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, maxWidth: 230, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  resultIcon: { fontSize: 16 },
  resultTitle: { fontSize: 13, fontWeight: '600', color: '#000' },
  resultRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  resultLabel: { fontSize: 12, color: '#6E6E73', width: 70 },
  barWrap: { flex: 1, height: 6, backgroundColor: '#F0F0F5', borderRadius: 10, overflow: 'hidden' },
  barTrack: { flex: 1, flexDirection: 'row', height: 6 },
  bar: { height: 6, borderRadius: 10, backgroundColor: '#1a3ed4' },
  barSecondary: { backgroundColor: '#AEAEB2' },
  resultPct: { fontSize: 11, color: '#1a3ed4', fontWeight: '600', width: 30, textAlign: 'right' },
  resultPctSecondary: { color: '#AEAEB2' },
  resultAction: { marginTop: 10, backgroundColor: '#1a3ed4', borderRadius: 10, padding: 9, alignItems: 'center' },
  resultActionText: { fontSize: 12, color: '#fff', fontWeight: '500' },

  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 0.5, borderTopColor: '#E5E5EA',
    paddingTop: 10, paddingHorizontal: 10, gap: 8,
  },
  attachBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  attachIcon: { fontSize: 16 },
  inputField: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 13, color: '#000' },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a3ed4', alignItems: 'center', justifyContent: 'center' },
  sendIcon: { fontSize: 14, color: '#fff' },
});
