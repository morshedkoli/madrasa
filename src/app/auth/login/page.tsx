'use client'

import { useState } from 'react'
import { Mail, Lock, LogIn, School } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'লগইন ব্যর্থ হয়েছে')
        setLoading(false)
        return
      }

      const role = data.user?.role
      if (role === 'admin') window.location.href = '/admin'
      else if (role === 'teacher') window.location.href = '/teacher'
      else if (role === 'accountant') window.location.href = '/accounts'
      else window.location.href = '/'
    } catch {
      setError('নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#1B6B3A]/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1B6B3A] rounded-xl mb-4">
              <School className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1B6B3A]" style={{ fontFamily: 'Amiri, serif' }}>
              মাদ্রাসা ম্যানেজমেন্ট সিস্টেম
            </h1>
            <p className="text-gray-500 mt-1">আপনার অ্যাকাউন্টে সাইন ইন করুন</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="আপনার ইমেইল লিখুন"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B6B3A] text-white py-2.5 rounded-lg font-medium hover:bg-[#155a30] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'সাইন ইন হচ্ছে...' : 'সাইন ইন'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-[#FAF7F0] rounded-lg">
            <p className="text-xs text-gray-500 text-center mb-2">ডেমো ক্রেডেনশিয়াল</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>প্রশাসক: admin@madrasa.com / password123</p>
              <p>শিক্ষক: teacher@madrasa.com / password123</p>
              <p>হিসাবরক্ষক: accounts@madrasa.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
