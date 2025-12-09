import { StyleSheet } from 'react-native-unistyles';

const theme = {
    colors: {
        primaryGreen: '#CEEA99',
        altGreen: '#73c59e',
        midGreen: '#40664b',
        darkGreen: '#111b13',
        sproutTeal: '#5BBFBA',
        white: '#fbfeff',
        cream: '#FDF6F0',
        black: '#2e2e2e',
        gray: '#9E9E9E',
        purple: '#7477a0',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
        xxxl: 64,
    },
    radius: {
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        full: 9999,
    },
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
        xxxl: 48,
    },
    fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        black: '900' as const,
    },
} as const;

type AppTheme = typeof theme;

const breakpoints = {
    xs: 0,
    sm: 390,
    md: 768,
    lg: 1024,
} as const;

type AppBreakpoints = typeof breakpoints;

StyleSheet.configure({
    themes: {
        light: theme,
    },
    breakpoints,
    settings: {
        initialTheme: 'light',
    },
});

// This is needed, linting hates it, I haven't found a better solution.
declare module 'react-native-unistyles' {
    export interface UnistylesBreakpoints extends AppBreakpoints {}
    export interface UnistylesThemes {
        light: AppTheme;
    }
}