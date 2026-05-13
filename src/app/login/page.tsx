import { redirect } from 'next/navigation'

// Trainers gaan direct naar het dashboard — geen login nodig voor de MVP
export default function LoginPage() {
  redirect('/dashboard')
}
