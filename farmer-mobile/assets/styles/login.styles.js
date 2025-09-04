import { StyleSheet, Dimensions, Platform } from 'react-native';
import { getColors } from '../../constants/colors';
const { width, height } = Dimensions.get('window');

const C = getColors('light');

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.surface,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#004d00',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 22,
        paddingTop: 120,
        
    },
    welcomeText: {
        fontSize: 42,
        fontFamily: Platform.select({
            ios: 'Georgia',
            android: 'serif',
        }),
        fontWeight: '700',
        color: '#000000',
        marginBottom: -5,
    },
    welcomeSubText: {
        fontSize: 42,
        fontFamily: Platform.select({
            ios: 'Georgia',
            android: 'serif',
        }),
        fontWeight: '700',
        color: '#000000',
        marginBottom: 50,
    },
    inputWrapper: {
        height: 45,
        borderWidth: 1.5,
        borderColor: C.outline,
        borderRadius: 26,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        marginBottom: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000000',
        paddingVertical: 8,
        marginLeft: 12,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        color: '#666666',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 120,
    },
    loginButton: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        right: 20,
        height: 45,
        backgroundColor: C.primary,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    loginButtonDisabled: {
        backgroundColor: C.muted,
        opacity: 0.7,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    registerContainer: {
        position: 'absolute',
        bottom: 38,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: '#666666',
        fontSize: 13,
    },
    registerLink: {
        color: C.primary,
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 4,
    }
});