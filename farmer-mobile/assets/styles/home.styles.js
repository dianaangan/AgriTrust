import { StyleSheet, Dimensions, Platform } from 'react-native';
import getColors from '../../constants/colors';

const { width } = Dimensions.get('window');
const colors = getColors('light');

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        backgroundColor: '#004b12',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 30,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        fontFamily: Platform.select({
            ios: 'System',
            android: 'Roboto',
        }),
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        color: '#FFFFFF',
        marginRight: 8,
        fontWeight: '400',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    contentContainer: {
        flex: 1,
        // Wider outer padding to match design
        paddingHorizontal: 32,
        paddingTop: 28,
    },
    gridContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        // Slightly widen horizontal gap between cards (increase the subtracted gap)
        width: (width - 32 * 2 - 12) / 2,
        height: 105,
        backgroundColor: '#FFFFFF',
        // Thicker outline to make the outside of the card look wider
        borderWidth: 2,
        borderColor: '#0b6623',
        borderRadius: 30,
        // Slightly increase vertical spacing between rows
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    cardIcon: {
        marginBottom: 8,
    },
    cardText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0b6623',
        textAlign: 'center',
        lineHeight: 16,
        fontFamily: Platform.select({
            ios: 'System',
            android: 'Roboto',
        }),
    },
});
