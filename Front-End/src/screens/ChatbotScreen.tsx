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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { chatbotApi } from '../config/api';

type MessageType = 'bot' | 'user';

interface Message {
  id: string;
  type: MessageType;
  text: string;
  time: string;
}

interface HistoryEntry {
  role: string;
  content: string;
}

const getTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const uid = () => Math.random().toString(36).slice(2);

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
      <View style={styles.bubbleBot}>
        <Text style={styles.bubbleBotText}>{msg.text}</Text>
        <Text style={styles.timeBot}>{msg.time}</Text>
      </View>
    </View>
  );
}

function UserMessage({ msg }: { msg: Message }) {
  return (
    <View style={styles.msgUser}>
      <View style={styles.bubbleUser}>
        <Text style={styles.bubbleUserText}>{msg.text}</Text>
        <Text style={styles.timeUser}>{msg.time} ✓✓</Text>
      </View>
    </View>
  );
}

export default function ChatbotScreen() {
  const navigation = useNavigation();
  const route      = useRoute<any>();
  const userName: string = route.params?.userName ?? 'there';
  const insets = useSafeAreaInsets();

  const [messages, setMessages]       = useState<Message[]>([]);
  const [inputText, setInputText]     = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState<HistoryEntry[]>([]);

  const flatListRef = useRef<FlatList>(null);

  // Welcome messages on mount
  useEffect(() => {
    const t1 = setTimeout(() => setIsTyping(true), 400);
    const t2 = setTimeout(() => {
      setIsTyping(false);
      setMessages([{
        id: 'welcome-1', type: 'bot',
        text: `Hi ${userName}! 👋 I'm DermaCam, your AI skin disease assistant. I can answer questions about 8 skin conditions in English and Arabic.`,
        time: getTime(),
      }]);
    }, 1600);
    const t3 = setTimeout(() => setIsTyping(true), 2400);
    const t4 = setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: 'welcome-2', type: 'bot',
        text: "Ask me about symptoms, causes, severity, or when to see a doctor. For image analysis, use the Camera tab 📷",
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

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isTyping) return;

    addMessage({ id: uid(), type: 'user', text, time: getTime() });
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    try {
      const { data } = await chatbotApi.post('/chat', {
        message: text,
        history: chatHistory,
      });

      const reply = data.reply as string;
      setIsTyping(false);
      addMessage({ id: uid(), type: 'bot', text: reply, time: getTime() });
      setChatHistory(prev => [
        ...prev,
        { role: 'user',      content: text  },
        { role: 'assistant', content: reply },
      ]);
    } catch {
      setIsTyping(false);
      addMessage({
        id: uid(), type: 'bot',
        text: "I'm having trouble connecting right now. Please make sure the chatbot service is running and try again.",
        time: getTime(),
      });
    }
  };

  const handleClearChat = () => {
    setMenuVisible(false);
    setMessages([]);
    setChatHistory([]);
    setIsTyping(false);
    setInputText('');
  };

  const renderItem = ({ item }: { item: Message }) =>
    item.type === 'bot' ? <BotMessage msg={item} /> : <UserMessage msg={item} />;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1a3ed4" translucent={false} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🤖</Text>
        </View>
        <View style={styles.botInfo}>
          <Text style={styles.botName}>DermaCam Assistant</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>Online · RAG-powered AI</Text>
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
            <TouchableOpacity style={styles.menuItem} onPress={handleClearChat}>
              <Text style={styles.menuItemIcon}>✏️</Text>
              <Text style={styles.menuItemText}>New Chat</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleClearChat}>
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
          <TextInput
            style={styles.inputField}
            placeholder="Ask about a skin condition..."
            placeholderTextColor="#AEAEB2"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline={false}
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[styles.sendBtn, isTyping && { opacity: 0.5 }]}
            onPress={handleSend}
            activeOpacity={0.85}
            disabled={isTyping}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
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
    padding: 10, maxWidth: '75%',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  bubbleBotText: { fontSize: 13, color: '#000', lineHeight: 20 },
  timeBot: { fontSize: 10, color: '#AEAEB2', marginTop: 4 },
  typingBubble: { paddingVertical: 12, paddingHorizontal: 16 },

  msgUser: { alignItems: 'flex-end' },
  bubbleUser: { backgroundColor: '#1a3ed4', borderRadius: 18, borderBottomRightRadius: 4, padding: 10, maxWidth: '75%' },
  bubbleUserText: { fontSize: 13, color: '#fff', lineHeight: 20 },
  timeUser: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4, textAlign: 'right' },

  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 0.5, borderTopColor: '#E5E5EA',
    paddingTop: 10, paddingHorizontal: 10, gap: 8,
  },
  inputField: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 13, color: '#000' },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a3ed4', alignItems: 'center', justifyContent: 'center' },
  sendIcon: { fontSize: 14, color: '#fff' },
});
