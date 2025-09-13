import { StyleSheet, Dimensions } from "react-native";
import getColors from "../../constants/colors";

const { width } = Dimensions.get("window");
const colors = getColors("light");

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
  headerSection: {
    flex: 0,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  progressWrapper: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 8,
  },
  progressTrack: {
    width: "100%",
    height: 12,
    backgroundColor: colors.track,
    borderRadius: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "20%",
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 38,
    lineHeight: 45,
    fontWeight: "700",
    color: colors.text,
    marginTop: 8,
    marginBottom: 15,
    fontFamily: "serif",
    textAlign: "left",
  },
  formSection: {
    flex: 1,
    justifyContent: "center",
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.outline,
    borderRadius: 24,
    paddingHorizontal: 18,
    marginVertical: 5,
    color: colors.text,
    backgroundColor: "transparent",
  },

  inputWrapper: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.outline,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginVertical: 5,
  },

  inputWrapperError: {
    borderColor: '#ff3333',
  },

  inputFlex: {
    flex: 1,
    color: colors.text,
    backgroundColor: "transparent",
  },

  eyeButton: {
    padding: 4,
  },

  inputError: {
    borderColor: '#FF3B30', // Red border for error state
  },
  bottomSection: {
    flex: 0,
    marginTop: 80,
    paddingBottom: 25,
  },
  continueButton: {
    width: width - 48,
    maxWidth: 520,
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "center",
  },
  continueText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginText: {
    fontSize: 12,
    color: colors.muted,
  },
  loginLink: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
    marginLeft: 4,
  },
});
