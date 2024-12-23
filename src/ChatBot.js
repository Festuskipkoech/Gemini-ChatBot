import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import ChatBubble from './ChatBubble';
import { API_KEY } from './api';
import { speak, isSpeakingAsync, stop } from "expo-speech";

export default function ChatBot() {
    const [chat, setChat] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleUserInput = async () => {
        // Add user input to the chat
        let updatedChat = [
            ...chat,
            {
                role: "user",
                parts: [{ text: userInput }],
            },
        ];

        setLoading(true);
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
                {
                    contents: updatedChat,
                },
            );
            console.log("Gemini response:", response.data);
            const modelResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (modelResponse) {
                const updatedChatWithModel = [
                    ...updatedChat,
                    {
                        role: "model",
                        parts: [{ text: modelResponse }],
                    },
                ];
                setChat(updatedChatWithModel);
                setUserInput("");
            }
        } catch (error) {
            console.error("Error calling Gemini pro API: ", error);
            console.error("Error response:", error.response);
            setError("An error occurred! Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSpeech = async (text) => {
        if (isSpeaking) {
            // Stop the speech if the user is speaking
            stop();
            setIsSpeaking(false);
        } else {
            // If not speaking, start the speech
            if (!(await isSpeakingAsync())) {
                speak(text);
                setIsSpeaking(true);
            }
        }
    };

    const renderChatItem = ({ item }) => (
        <ChatBubble
            role={item.role}
            text={item.parts[0].text}
            onSpeech={() => handleSpeech(item.parts[0].text)}
        />
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My ChatApp</Text>
            <FlatList
                data={chat}
                renderItem={renderChatItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.chatContainer}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Chat with me"
                    placeholderTextColor="#aaa"
                    value={userInput}
                    onChangeText={setUserInput}
                />
                <TouchableOpacity style={styles.button} onPress={handleUserInput}>
                    <Text style={styles.buttonText}>Send</Text>
                </TouchableOpacity>
            </View>
            {loading && <ActivityIndicator style={styles.loading} color="#333" />}
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#F9F6EE",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
        marginTop: 40,
        textAlign: "center",
    },
    chatContainer: {
        flexGrow: 1,
        backgroundColor:"#fff",
        justifyContent: "flex-end",
        borderRadius:20,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    input: {
        flex: 1,
        height: 50,
        marginRight: 10,
        padding: 8,
        borderColor: "#333",
        borderWidth: 1,
        borderRadius: 25,
        color: "#333",
        backgroundColor: "#fff",
    },
    button: {
        padding: 10,
        backgroundColor: "#007aff",
        borderRadius: 25,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        backgroundColor:"0000FF",

    },
    loading: {
        marginTop: 10,
    },
    error: {
        color: "red",
        marginTop: 10,
    },
});
