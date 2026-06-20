'use client'

import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
  image?: string | null
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { user, loading }
}
