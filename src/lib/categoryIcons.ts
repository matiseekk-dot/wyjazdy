import { BedDouble, Car, Package, Plane, Shield, Ticket, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import type { ItemCategory } from '../types'

export const CATEGORY_ICONS: Record<ItemCategory, LucideIcon> = {
  flight: Plane,
  accommodation: BedDouble,
  transport: Car,
  activity: Ticket,
  visa_insurance: Shield,
  food: UtensilsCrossed,
  other: Package,
}
