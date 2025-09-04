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
    width: '100%',
    backgroundColor: colors.primary,
  },

  header: {
    marginBottom: 30,
  },

  title: {
    fontSize: 40,
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
    marginBottom: 10,
  },

  section: {
    marginBottom: 25,
  },

  imageSection: {
    marginBottom: 20,
  },

  imageUploadButton: {
    height: 50,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  imageUploadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  imageUploadText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },

  imagePreviewContainer: {
    height: 50,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 28,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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

  inputError: {
    borderColor: '#FF3B30',
  },

  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },

  registerButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 200,
    marginBottom: 15,
  },

  registerButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  registerButtonDisabled: {
    backgroundColor: colors.muted,
    opacity: 0.6,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },

  termsText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },

  termsLink: {
    fontWeight: '700',
    color: colors.primary,
  },
});


