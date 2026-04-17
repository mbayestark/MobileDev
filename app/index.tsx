import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

export default function BlogList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const { theme } = useTheme();
    const router = useRouter();

    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/posts')
            .then(response => response.json())
            .then((data: Post[]) => setPosts(data.slice(0, 7)))
            .catch(error => console.error('Error fetching posts:', error));
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {posts.map(post => (
                <TouchableOpacity key={post.id} onPress={() => router.push(`/details/${post.id}`)} style={[styles.postContainer, { borderBottomColor: theme.text }]}>
                    <Text style={[styles.postTitle, { color: theme.text }]}>{post.title}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    postTitle: {
        fontSize: 20,
        marginBottom: 10,
    },
    postContainer: {
        padding: 10,
        borderBottomWidth: 1,
    },
})
