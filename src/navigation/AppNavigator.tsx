import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../stores/useAppStore';
import { LoginScreen } from '../screens/LoginScreen';
import { SproutListScreen } from '../screens/SproutListScreen';
import { SproutDetailScreen } from '../screens/SproutDetailScreen';
import { SproutOverviewScreen } from '../screens/SproutOverviewScreen';
import { SproutSettingsScreen } from '../screens/SproutSettingsScreen';
import { ReframesListScreen } from '../screens/ReframesListScreen';
import { TriggersListScreen } from '../screens/TriggersListScreen';
import { SproutAppearanceScreen } from '../screens/SproutApperanceScreen';

export type RootStackParamList = {
    Login: undefined;
    SproutList: undefined;
    SproutDetail: { sproutId: string };
    SproutOverview: undefined;
    SproutSettings: undefined;
    ReframesList: undefined;
    TriggersList: undefined;
    SproutAppearance: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    const isAuthenticated = useAppStore(state => state.isAuthenticated);
    
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    <>
                        <Stack.Screen name="SproutList" component={SproutListScreen} />
                        <Stack.Screen name="SproutDetail" component={SproutDetailScreen} />
                        <Stack.Screen name="SproutOverview" component={SproutOverviewScreen} />
                        <Stack.Screen name="SproutSettings" component={SproutSettingsScreen} />
                        <Stack.Screen name="ReframesList" component={ReframesListScreen} />
                        <Stack.Screen name="TriggersList" component={TriggersListScreen} />
                        <Stack.Screen name="SproutAppearance" component={SproutAppearanceScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};