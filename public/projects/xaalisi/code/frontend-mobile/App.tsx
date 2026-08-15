import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <View style={styles.card}>
        <Text style={styles.title}>XAALISI MOBILE</Text>
        <Text style={styles.subtitle}>Welcome! Start modifying this file to see live updates.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D', // Theme Black
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1E1E1E', // Dark grey
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCC603', // Theme Yellow
    alignItems: 'center',
  },
  title: {
    color: '#00D084', // Theme Green
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});
