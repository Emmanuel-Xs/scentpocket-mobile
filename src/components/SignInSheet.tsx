import { useEffect } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/auth/AuthProvider'
import { colors, radius, space, type as t } from '@/theme'
import { SignInPrompt } from './SignInPrompt'

type Props = { visible: boolean; onClose: () => void; title: string; body: string }

/** A bottom sheet with the Google button, for actions that need an account. Closes itself on success. */
export function SignInSheet({ visible, onClose, title, body }: Props) {
  const insets = useSafeAreaInsets()
  const { status } = useAuth()
  useEffect(() => {
    if (visible && status === 'signedIn') onClose()
  }, [visible, status, onClose])

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}>
        <SignInPrompt title={title} body={body} />
        <Pressable onPress={onClose} accessibilityRole="button" style={styles.close}>
          <Text style={[t.bodyStrong, { color: colors.muted }]}>Not now</Text>
        </Pressable>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: { backgroundColor: colors.cream, padding: space.lg, gap: space.sm, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  close: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
})
