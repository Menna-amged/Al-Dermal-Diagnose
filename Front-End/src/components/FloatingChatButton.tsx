import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, StyleSheet, Text } from "react-native";

export default function FloatingChatButton(){

return(

<TouchableOpacity style={styles.button}>
<MaterialCommunityIcons name="robot-outline" size={28} color="#fff" />
</TouchableOpacity>

);

}

const styles = StyleSheet.create({

button:{
position:"absolute",
right:20,
bottom:80,
backgroundColor:"#2563EB",
padding:18,
borderRadius:50
},

text:{
color:"#fff",
fontWeight:"bold"
}

});
