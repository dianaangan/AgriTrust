import { StyleSheet, Dimensions, Platform } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        height: height * 0.45,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 150,
    },
    illustration: {
        width: width * 0.62,
        height: height * 0.30,
        resizeMode: 'contain',
    },
    bottomContent: {
        width: '100%',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 24,
    },
    title: {
        fontSize: 36,
        fontWeight: '700',
        color: '#000000',
        marginTop: 16,
        textAlign: 'center',
        // try to give a serif-like look; platform fallback if not available
        fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    },
    description: {
        fontSize: 12,
        color: '#666666',
        lineHeight: 16,
        textAlign: 'center',
        width: '72%',
        marginTop: 8,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 120,
        marginBottom: 20
    },
    getStartedButton: {
        width: '86%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#0b6623', // green outline
        borderRadius: 28,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    getStartedText: {
        color: '#0b6623',
        fontSize: 15,
        fontWeight: '600',
    },
    loginButton: {
        width: '86%',
        backgroundColor: '#0b6623', // filled green
        borderRadius: 28,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    loginText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});
