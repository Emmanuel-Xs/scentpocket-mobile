import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '@/auth/AuthProvider'
import { meQuery } from '@/auth/queries'
import { Button } from '@/components/Button'
import { colors, radius, shadow, space, type as t } from '@/theme'

const initials = (source: string) =>
  source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')

/** Who is signed in (from GET /me), with sign out. */
export function ProfileCard() {
  const { signOut } = useAuth()
  const me = useQuery(meQuery())

  return (
    <View style={styles.card}>
      {me.isPending ? (
        <ActivityIndicator color={colors.ink} />
      ) : me.isError ? (
        <>
          <Text style={[t.body, { color: colors.danger }]}>{me.error.message}</Text>
          <Button label="Try again" variant="secondary" onPress={() => void me.refetch()} />
        </>
      ) : (
        <View style={styles.row}>
          {me.data.avatarUrl ? (
            <Image source={{ uri: me.data.avatarUrl }} style={styles.avatar} accessibilityLabel="Your photo" />
          ) : (
            <View style={[styles.avatar, styles.initials]}>
              <Text style={[t.bodyStrong, { color: colors.cream }]}>{initials(me.data.name ?? me.data.email)}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={t.h3} numberOfLines={1}>
              {me.data.name ?? 'Your account'}
            </Text>
            <Text style={[t.small, { color: colors.muted }]} numberOfLines={1}>
              {me.data.email}
            </Text>
          </View>
        </View>
      )}
      <Button label="Sign out" variant="secondary" onPress={() => void signOut()} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: space.lg,
    ...shadow.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  initials: { backgroundColor: colors.designer, alignItems: 'center', justifyContent: 'center' },
})
