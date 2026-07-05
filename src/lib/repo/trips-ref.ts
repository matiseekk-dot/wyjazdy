import { collection } from 'firebase/firestore'
import { db } from '../firebase'

export const tripsCol = collection(db, 'trips')
