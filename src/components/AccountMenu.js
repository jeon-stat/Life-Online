import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { theme } from "../constants/theme.js";

const APP_VERSION = "1.0.0";

export function AccountMenu({ visible, currentUser, totalSteps = 0, goal = 0, onClose, onLogout }) {
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const nickname = currentUser?.nickname?.trim() || "내 계정";
  const handle = currentUser?.handle ? `@${currentUser.handle}` : "@walk";
  const loginMethod = "로컬 로그인";
  const joinedAt = formatDate(currentUser?.createdAt);

  const closeMenu = () => {
    setLogoutConfirmVisible(false);
    setDeleteConfirmVisible(false);
    onClose?.();
  };

  const confirmLogout = () => {
    setLogoutConfirmVisible(false);
    closeMenu();
    onLogout?.();
  };

  const confirmDelete = () => {
    setDeleteConfirmVisible(false);
    closeMenu();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <Pressable style={styles.sheet} onPress={() => null}>
            <View style={styles.handleBar} />

            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>메뉴</Text>
                <Text style={styles.headerSubtitle}>계정과 설정을 모아둔 곳</Text>
              </View>
              <Pressable onPress={closeMenu} style={styles.closeButton}>
                <Text style={styles.closeButtonLabel}>×</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <Section title="계정 정보">
                <InfoCard
                  label={nickname}
                  value={[
                    handle,
                    `${loginMethod} · ${joinedAt}`,
                    `누적 ${formatNumber(totalSteps)}보`,
                  ].join("\n")}
                />
              </Section>

              <Section title="설정">
                <MenuRow label="알림" value="준비 중" />
                <MenuRow label="목표" value={`${formatNumber(goal)}보`} />
                <MenuRow label="화면/테마" value="준비 중" />
                <MenuRow label="개인정보" value="준비 중" />
              </Section>

              <Section title="앱 정보">
                <MenuRow label="Life Online" value="작은 다이어리" />
                <MenuRow label="버전" value={`v${APP_VERSION}`} />
                <MenuRow label="문의/피드백" value="준비 중" />
              </Section>

              <Section title="계정 관리">
                <Pressable onPress={() => setLogoutConfirmVisible(true)} style={styles.actionButton}>
                  <Text style={styles.actionButtonLabel}>로그아웃</Text>
                </Pressable>
                <Pressable onPress={() => setDeleteConfirmVisible(true)} style={[styles.actionButton, styles.dangerButton]}>
                  <Text style={[styles.actionButtonLabel, styles.dangerButtonLabel]}>회원탈퇴</Text>
                </Pressable>
              </Section>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmModal
        visible={logoutConfirmVisible}
        title="로그아웃할까요?"
        description="다시 로그인하면 이어서 사용할 수 있어요."
        confirmLabel="로그아웃"
        confirmTone="normal"
        onCancel={() => setLogoutConfirmVisible(false)}
        onConfirm={confirmLogout}
      />

      <ConfirmModal
        visible={deleteConfirmVisible}
        title="정말 회원탈퇴할까요?"
        description="계정 정보와 기록이 삭제될 수 있어요."
        note="아직 실제 삭제 기능은 준비 중이에요."
        confirmLabel="확인"
        confirmTone="danger"
        onCancel={() => setDeleteConfirmVisible(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function InfoCard({ label, value }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function MenuRow({ label, value }) {
  return (
    <View style={styles.menuRow}>
      <View style={styles.menuRowMark}>
        <Text style={styles.menuRowMarkLabel}>◌</Text>
      </View>
      <Text style={styles.menuRowLabel}>{label}</Text>
      <Text style={styles.menuRowValue}>{value}</Text>
    </View>
  );
}

function ConfirmModal({ visible, title, description, note = null, confirmLabel, confirmTone, onCancel, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.confirmBackdrop} onPress={onCancel}>
        <Pressable style={styles.confirmCard} onPress={() => null}>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmDescription}>{description}</Text>
          {note ? <Text style={styles.confirmNote}>{note}</Text> : null}

          <View style={styles.confirmActions}>
            <Pressable onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonLabel}>취소</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={[styles.confirmButton, confirmTone === "danger" && styles.confirmButtonDanger]}
            >
              <Text style={[styles.confirmButtonLabel, confirmTone === "danger" && styles.confirmButtonLabelDanger]}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function formatDate(value) {
  if (!value) return "시작일 정보 없음";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "시작일 정보 없음";

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("ko-KR");
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17,17,17,0.28)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "88%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 8,
  },
  handleBar: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: 12,
  },
  headerTitle: {
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  headerSubtitle: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    marginTop: 2,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  closeButtonLabel: {
    color: theme.colors.ink,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  sectionBody: {
    gap: 8,
  },
  infoCard: {
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  infoTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  infoValue: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuRowMark: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuRowMarkLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "900",
  },
  menuRowLabel: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  menuRowValue: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  actionButton: {
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#111111",
    alignItems: "center",
  },
  dangerButton: {
    backgroundColor: "#fff4f4",
    borderWidth: 1,
    borderColor: "#f0b6b6",
  },
  actionButtonLabel: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  dangerButtonLabel: {
    color: "#b73f3f",
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,17,17,0.35)",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  confirmCard: {
    borderRadius: 26,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 10,
  },
  confirmTitle: {
    color: theme.colors.ink,
    fontSize: 20,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  confirmDescription: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  confirmNote: {
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    borderRadius: theme.radius.lg,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonLabel: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  confirmButton: {
    flex: 1,
    borderRadius: theme.radius.lg,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#111111",
  },
  confirmButtonDanger: {
    backgroundColor: "#ffefef",
    borderWidth: 1,
    borderColor: "#df9a9a",
  },
  confirmButtonLabel: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  confirmButtonLabelDanger: {
    color: "#b73f3f",
  },
});
