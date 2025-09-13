import { StyleSheet, Dimensions, Platform } from 'react-native';
import getColors from '../../constants/colors';
const { width, height } = Dimensions.get('window');

const C = getColors('light');

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: C.lightGray,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: '600',
        color: C.text,
    },
    logoutButton: {
        backgroundColor: C.error,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontFamily: Platform.select({
            ios: 'Georgia',
            android: 'serif',
        }),
        fontWeight: '700',
        color: '#000000',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 40,
        lineHeight: 22,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: C.lightGray,
        borderRadius: 12,
        padding: 20,
    },
    placeholderText: {
        fontSize: 16,
        color: C.muted,
        textAlign: 'center',
        lineHeight: 24,
    },
});
