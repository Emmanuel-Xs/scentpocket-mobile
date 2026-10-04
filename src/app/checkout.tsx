import { router } from 'expo-router'
import { Text, View } from 'react-native'
import { Button } from '@/components/Button'
import { colors, space, type as t } from '@/theme'

// M2.6 replaces this with the real checkout.
export default function Checkout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.cream, justifyContent: 'center', padding: space.xl, gap: space.lg }}>
      <Text style={t.h2}>Checkout is next</Text>
      <Button label="Back to cart" variant="secondary" onPress={() => router.back()} />
    </View>
  )
}
