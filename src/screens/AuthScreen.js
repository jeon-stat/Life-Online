import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "../auth/AuthProvider.js";
import { theme } from "../constants/theme.js";

const MODES = [
  { id: "signup", label: "아이디 만들기" },
  { id: "signin", label: "로그인" },
];

const ERROR_COPY = {
  invalid_profile: "아이디와 닉네임을 모두 입력해 주세요.",
  handle_taken: "이미 사용 중인 아이디예요.",
  account_not_found: "존재하지 않는 아이디예요.",
};

export function AuthScreen() {
  const { accounts, signIn, signUp } = useAuth();
  const [mode, setMode] = useState(accounts.length ? "signin" : "signup");
  const [handle, setHandle] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const subtitle = useMemo(
    () =>
      mode === "signup"
        ? "숫자를 채우는 앱이 아니라, 내 캐릭터의 하루를 함께 돌보는 산책 앱이에요."
        : "저장된 아이디로 다시 들어와서 오늘의 산책을 이어갈 수 있어요.",
    [mode],
  );

  function handleSubmit() {
    setError("");

    try {
      if (mode === "signup") {
        signUp({ handle, nickname });
        return;
      }

      signIn(handle);
    } catch (nextError) {
      setError(ERROR_COPY[nextError.message] ?? "다시 시도해 주세요.");
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.heroCard}>
        <Text style={styles.brand}>Life Online</Text>
        <Text style={styles.title}>내 캐릭터와 걷기</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.modeRow}>
        {MODES.map((item) => {
          const active = item.id === mode;
          return (
            <Pressable key={item.id} onPress={() => setMode(item.id)} style={[styles.modeButton, active && styles.modeButtonActive]}>
              <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.formCard}>
        <Text style={styles.fieldLabel}>아이디</Text>
        <TextInput
          value={handle}
          onChangeText={setHandle}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="예: jeonwalk"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
        />

        {mode === "signup" ? (
          <>
            <Text style={styles.fieldLabel}>닉네임</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="예: 지안"
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
            />
          </>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitLabel}>{mode === "signup" ? "산책 시작하기" : "다시 들어가기"}</Text>
        </Pressable>
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>이 앱만의 방향</Text>
        <Text style={styles.noteText}>
          기록을 많이 쌓는 것보다, 내 캐릭터가 산책 습관에 따라 성격과 추억을 얻는 느낌을 더 중요하게 만들고 있어요.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  heroCard: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    backgroundColor: "#eef7f0",
    borderWidth: 1,
    borderColor: "#dbe9de",
  },
  brand: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "900",
  },
  title: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 12,
    color: theme.colors.inkSoft,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "700",
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  modeButtonActive: {
    backgroundColor: theme.colors.ink,
    borderColor: theme.colors.ink,
  },
  modeLabel: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "900",
  },
  modeLabelActive: {
    color: "#ffffff",
  },
  formCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fieldLabel: {
    marginTop: 12,
    marginBottom: 8,
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "700",
    backgroundColor: "#ffffff",
  },
  error: {
    marginTop: 12,
    color: "#b75643",
    fontSize: 13,
    fontWeight: "800",
  },
  submitButton: {
    marginTop: 18,
    minHeight: 54,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  submitLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  noteCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: "#fff8ee",
    borderWidth: 1,
    borderColor: "#f0dfc1",
  },
  noteTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  noteText: {
    marginTop: 8,
    color: theme.colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700",
  },
});
