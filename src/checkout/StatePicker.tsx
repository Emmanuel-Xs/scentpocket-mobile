import { useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon } from '@/components/Icon'
import { colors, PRESSED_SCALE, radius, space, TOUCH, type as t } from '@/theme'

type Props = { states: string[]; value: string; onChange: (state: string) => void; error?: string }

/** A field that opens a searchable list of Nigerian states. */
export function StatePicker({ states, value, onChange, error }: Props) {
  const insets = useSafeAreaInsets()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const shown = states.filter((s) => s.toLowerCase().includes(query.trim().toLowerCase()))

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  return (
    <View style={{ gap: 6 }}>
      <Text style={[t.smallStrong, { color: colors.text2 }]}>State</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`State, ${value || 'not chosen'}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.box, !!error && styles.errorBox, pressed && { transform: [{ scale: PRESSED_SCALE }] }]}
      >
        <Text style={[t.body, { color: value ? colors.ink : colors.disabled }]}>{value || 'Choose a state'}</Text>
      </Pressable>
      {error ? <Text style={[t.small, { color: colors.danger }]} accessibilityRole="alert">{error}</Text> : null}

      <Modal visible={open} animationType="slide" onRequestClose={close}>
        <View style={[styles.sheet, { paddingTop: insets.top + space.md, paddingBottom: insets.bottom }]}>
          <View style={styles.head}>
            <Text style={t.h2}>Choose a state</Text>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" style={styles.close}>
              <Icon name="x" size={24} />
            </Pressable>
          </View>
          <View style={styles.search}>
            <Icon name="search" size={20} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search states"
              placeholderTextColor={colors.disabled}
              accessibilityLabel="Search states"
              autoCorrect={false}
              style={[t.body, { flex: 1, color: colors.ink, paddingVertical: 0 }]}
            />
          </View>
          <FlatList
            data={shown}
            keyExtractor={(s) => s}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Text style={[t.body, { color: colors.muted, padding: space.lg }]}>No state matches that.</Text>}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: item === value }}
                onPress={() => {
                  onChange(item)
                  close()
                }}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.blush }]}
              >
                <Text style={[item === value ? t.bodyStrong : t.body]}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    minHeight: TOUCH + 4,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  errorBox: { borderColor: colors.danger, borderWidth: 1.5 },
  sheet: { flex: 1, backgroundColor: colors.cream },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.lg, paddingBottom: space.md },
  close: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: space.lg,
    marginBottom: space.sm,
    minHeight: TOUCH,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  row: { minHeight: TOUCH, justifyContent: 'center', paddingHorizontal: space.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
})
