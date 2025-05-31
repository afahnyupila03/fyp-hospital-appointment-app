import Providers from '@/store/providers'
import './globals.css'
import { Footer } from './footer'
import { Header } from './header'
import { NotificationListener } from '@/components/NotificationListener'

export const metadata = {
  title: 'CareConnect - Connecting you to care, one appointment at a time.',
  description:
    'CareConnect is a modern healthcare appointment management platform that seamlessly connects patients with medical professionals for consultations, follow-ups, and specialist care — ensuring simple, secure, and efficient appointment scheduling.'
}

export default function RootLayout ({ children }) {
  return (
    <html lang='en' className='h-full'>
      <body className='h-full bg-gray-100'>
        <Providers>
          <NotificationListener />

          <div className='flex min-h-screen'>
            {/* Sidebar */}
            <Header />

            {/* Main content */}
            <div className='flex-1 flex flex-col'>
              <main className='flex-1 p-6 overflow-auto'>{children}</main>
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
