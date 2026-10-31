import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api'

/** GET a /api path. Returns { data, error, loading, reload, setData }. */
export function useApi(path) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const latest = useRef(0)

  const reload = useCallback(async () => {
    const call = ++latest.current
    setLoading(true)
    setError(null)
    try {
      const result = await api(path)
      if (call === latest.current) setData(result)
    } catch (err) {
      if (call === latest.current) setError(err)
    } finally {
      if (call === latest.current) setLoading(false)
    }
  }, [path])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, error, loading, reload, setData }
}
