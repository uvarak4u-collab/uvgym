import { route, clientToday } from '../_lib/http.js'
import { requireUser, publicUser } from '../_lib/auth.js'
import { getStreak } from '../_lib/streak.js'

export default route({
  GET: async (req, res) => {
    let user
    try {
      user = await requireUser(req)
    } catch (err) {
      // Being logged out is a normal answer here, not an error
      if (err.status === 401) return res.status(200).json({ user: null, streak: null })
      throw err
    }
    const streak = await getStreak(user.id, clientToday(req))
    res.status(200).json({ user: publicUser(user), streak })
  },
})
