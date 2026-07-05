import { Archive, Plane, Settings } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { colors, spacing, fontSize, fontWeight, layout } from '../tokens'

const tabs = [
  { to: '/', label: 'Wyjazdy', icon: Plane, end: true },
  { to: '/archive', label: 'Archiwum', icon: Archive, end: false },
  { to: '/settings', label: 'Ustawienia', icon: Settings, end: false },
]

export function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: layout.navHeight }}>
        <Outlet />
      </main>
      <nav style={styles.nav}>
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} style={styles.tab}>
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  padding: `${spacing[1]} ${spacing[4]}`,
                  borderRadius: 'var(--radius-lg)',
                  background: isActive ? colors.accentBg : 'transparent',
                  color: isActive ? colors.accent : colors.textMuted,
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                }}
              >
                <Icon size={21} strokeWidth={isActive ? 2.3 : 2} />
                <span style={{ fontSize: fontSize.xs, fontWeight: isActive ? fontWeight.semibold : fontWeight.regular }}>
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: layout.navHeight,
    display: 'flex',
    background: colors.surfaceRaised,
    boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.04)',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  tab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
  },
} as const satisfies Record<string, React.CSSProperties>
