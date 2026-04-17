import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

export default function BlogDetails() {
    const { theme } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        if (id) {
            fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
                .then(response => response.json())
                .then((data: Post) => setPost(data))
                .catch(error => console.error('Error fetching post:', error));
        }
    }, [id]);

    if (!post) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <Text style={[styles.title, { color: theme.text }]}>{post.title}</Text>
            <Text style={[styles.body, { color: theme.text }]}>{post.body}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
    },
});
