import { StyleSheet } from 'react-native';
import getColors from '../../constants/colors';

const colors = getColors('light');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 35,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressContainer: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 8,
  },

  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: colors.track,
    borderRadius: 12,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    width: '70%',
    backgroundColor: colors.primary,
  },

  header: {
    marginBottom: 30,
  },

  title: {
    fontSize: 33,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 18,
    fontFamily: 'serif',
    textAlign: 'left',
  },

  subtitle: {
    fontSize: 15,
    color: colors.muted,
    lineHeight: 22,
    marginBottom: -12,
  },

  section: {
    marginBottom: 25,
  },


  // Form Labels
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 8,
  },

  // Continue Button
  continueButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 200,
    marginBottom: 20,
  },

  continueButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  continueButtonDisabled: {
    backgroundColor: colors.muted,
    opacity: 0.7,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Removed terms section in this screen per final mock

  // Error Styles
  inputError: {
    borderColor: '#FF3B30',
  },

  errorContainer: {
    backgroundColor: '#FFE6E6',
    borderColor: '#FF3B30',
    borderWidth: 1, 
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },

  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Input Fields
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },

  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.outline,
    borderRadius: 25,
    paddingHorizontal: 14,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },

  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },

  textInput: {
    fontSize: 15,
    color: colors.text,
  },

  textInputFlex: {
    flex: 1,
  },

  __placeholderColor: '#888',

  inputHalf: {
    flex: 1,
  },

  inlineCardLogos: {
    width: 78,
    height: 18,
  },

  cvcIcon: {
    width: 24,
    height: 16,
  },


});



