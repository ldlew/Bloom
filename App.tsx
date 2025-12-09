import './src/styles/unistyles'; 

import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { appContainer } from './src/infrastructure/AppContainer'; 
// import { AppNavigator } from './src/navigation copy/AppNavigator';

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                await appContainer.init();
                setIsReady(true);
            } catch (err) {
                console.error('Failed to initialize app:', err);
                setError('Failed to start app. Please restart.');
            }
        };
        init();
    }, []);

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
            </View>
        );
    }

    if (!isReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#CEEA99" />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
        </SafeAreaProvider>
    );
}