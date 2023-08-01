import './globals.css'
import { Inter } from 'next/font/google'
import { AppProvider } from './AppContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Gym Tracker',
  description: 'Workout Progress Tracking',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <AppProvider>
        <body className={inter.className}>{children}</body>
      </AppProvider>
    </html>
  )
}
