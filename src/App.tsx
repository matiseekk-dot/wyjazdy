import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './app/Layout'
import { ArchivePage } from './features/archive/ArchivePage'
import { ChecklistPage } from './features/checklist/ChecklistPage'
import { ConverterPage } from './features/converter/ConverterPage'
import { ItemFormPage } from './features/items/ItemFormPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { SettlementsPage } from './features/settlements/SettlementsPage'
import { TripDashboardPage } from './features/trips/TripDashboardPage'
import { TripFormPage } from './features/trips/TripFormPage'
import { TripsListPage } from './features/trips/TripsListPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TripsListPage />} />
        <Route path="archive" element={<ArchivePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="trips/new" element={<TripFormPage />} />
        <Route path="trips/:tripId" element={<TripDashboardPage />} />
        <Route path="trips/:tripId/edit" element={<TripFormPage />} />
        <Route path="trips/:tripId/items/new" element={<ItemFormPage />} />
        <Route path="trips/:tripId/items/:itemId" element={<ItemFormPage />} />
        <Route path="trips/:tripId/settlements" element={<SettlementsPage />} />
        <Route path="trips/:tripId/converter" element={<ConverterPage />} />
        <Route path="trips/:tripId/checklist" element={<ChecklistPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
