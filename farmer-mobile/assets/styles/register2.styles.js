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
    width: '55%', 
    backgroundColor: colors.primary,
  },

  header: {
    marginBottom: 30,
  },

  title: {
    fontSize: 35, 
    lineHeight: 45, 
    fontWeight: '700', 
    color: colors.text,
    marginTop: -8, 
    marginBottom: 18, 
    fontFamily: 'serif', 
    textAlign: 'left', 
  },

  subtitle: {
    fontSize: 15,
    color: colors.muted,
    lineHeight: 22,
    marginBottom: -15,
  },

  formContainer: {
    marginBottom: 30,
  },

  inputContainer: {
    marginBottom: 3,
    position: 'relative',
  },

  input: {
    height: 48, 
    borderWidth: 1.5, 
    borderColor: colors.outline,
    borderRadius: 24,  
    paddingHorizontal: 18, 
    paddingRight: 60, // Add space for icons
    marginVertical: 5,
    color: colors.text,
    backgroundColor: 'transparent', 
  },

  textArea: {
    height: 100, 
    borderWidth: 1.5, 
    borderColor: colors.outline,
    borderRadius: 24, 
    paddingHorizontal: 18, 
    marginTop: 4,
    paddingTop: 12,
    paddingBottom: 40,
    fontSize: 14,
    color: colors.text,
    backgroundColor: 'transparent', 
  },

  inputError: {
    borderColor: '#FF3B30',
  },

  errorText: {
    color: '#FF3B30',
    marginTop: 2,
    marginLeft: 4,
  },

  prefilledNote: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },

  characterCount: {
    position: 'absolute',
    bottom: 12,
    right: 16,
  },

  characterCountText: {
    fontSize: 14,
    color: colors.muted,
  },

  imageUploadButton: {
    height: 48, 
    marginTop: 10,
    borderWidth: 1.5, 
    borderColor: colors.outline,
    borderRadius: 24, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', 
    paddingHorizontal: 18,
  },

  imageUploadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },

  imageUploadIconLeft: {
    position: 'absolute',
    left: 55,
  },

  imageUploadText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },

  imageUploadTextCenter: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
    paddingLeft: 50,
  },

  imagePreviewContainer: {
    height: 48,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: colors.outline,
    borderRadius: 24,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },

  imageFileName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginRight: 12,
  },

  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },

  continueButton: {
    width: '100%', 
    backgroundColor: colors.primary,
    borderRadius: 28, 
    paddingVertical: 14, 
    alignItems: 'center',
    alignSelf: 'center', 
  },

  continueButtonText: {
    color: '#fff', 
    fontWeight: '700',
    fontSize: 16, 
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

  // Location input styles
  loadingIndicator: {
    position: 'absolute',
    right: 60,
    top: 18,
  },

  clearButton: {
    position: 'absolute',
    right: 18,
    top: 15,
    padding: 4,
    zIndex: 1,
  },

  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderRadius: 8,
    marginTop: -5,
    maxHeight: 160,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 9999,
  },

  suggestionsList: {
    flex: 1,
    zIndex: 10000,
    overflow: 'hidden',
    maxHeight: '100%',
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0,
    backgroundColor: '#FFFFFF',
  },

  locationIcon: {
    marginRight: 12,
    color: '#5F6368',
  },

  suggestionTextContainer: {
    flex: 1,
  },

  suggestionMainText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#202124',
    marginBottom: 2,
  },

  suggestionSecondaryText: {
    fontSize: 14,
    color: '#5F6368',
  },
});
