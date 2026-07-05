import { colors, spacing, fontSize } from '../tokens'

const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

export function ConfigMissingScreen() {
  return (
    <div style={{ padding: spacing[5], maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: fontSize.xl, marginBottom: spacing[3] }}>Brak konfiguracji Firebase</h1>
      <p style={{ color: colors.textMuted, marginBottom: spacing[4] }}>
        Plik <code>.env</code> istnieje, ale nie ma w nim wartości. Uzupełnij go danymi z konsoli
        Firebase (Project settings → Your apps → SDK setup and configuration):
      </p>
      <ul style={{ color: colors.textMuted, paddingLeft: spacing[5], marginBottom: spacing[4] }}>
        {REQUIRED_VARS.map((name) => (
          <li key={name}>
            <code>{name}</code>
          </li>
        ))}
      </ul>
      <p style={{ color: colors.textMuted }}>Po zapisaniu <code>.env</code> zrestartuj <code>npm run dev</code>.</p>
    </div>
  )
}
