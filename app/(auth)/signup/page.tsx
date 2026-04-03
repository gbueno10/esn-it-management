import { redirect } from 'next/navigation'

export default function SignupPage() {
  // Redirect to login page which has signup tab
  redirect('/login')
}
