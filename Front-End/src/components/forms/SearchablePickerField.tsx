import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
} from "react-native";
import { useFormikContext } from "formik";
import colors from "../../config/colors";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  name: string;
  label: string;
  options: string[];
  placeholder?: string;
};

export default function SearchablePickerField({
  name,
  label,
  options,
  placeholder = "Select",
}: Props) {
  const { values, setFieldValue } = useFormikContext<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setModalVisible(true)}
      >
        <Text>{values[name] || placeholder}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
             <View style={styles.modalHeader}>
    <Text style={styles.modalTitle}>{label}</Text>
    <TouchableOpacity onPress={() => {
      setModalVisible(false);
      setSearchText("");
    }}>
      <Ionicons name="close" size={24} color={colors.black} />
    </TouchableOpacity>
  </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchText}
              onChangeText={setSearchText}
            />

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    setFieldValue(name, item);
                    setModalVisible(false);
                    setSearchText("");
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: "center", marginTop: 10 }}>
                  No results
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {   fontSize: 16,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 6,
      marginLeft: 5,
      alignSelf: "flex-start", },
  input: {
  color: colors.darkGray,
    borderRadius: 10,
    padding: 12,
    justifyContent: "center",
    backgroundColor: colors.lightGray,
    
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 12,
    maxHeight: "70%",
  },
  modalHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 15,
  borderBottomWidth: 1,
  borderColor: colors.lightGray,
},
modalTitle: {
  fontSize: 16,
  fontWeight: "700",
},
  searchInput: {
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
    padding: 10,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
  },
});