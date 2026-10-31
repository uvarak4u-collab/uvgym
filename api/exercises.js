import { route, HttpError } from './_lib/http.js'
import { db } from './_lib/db.js'
import { requireUserId } from './_lib/auth.js'

const GROUPS = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

export default route({
  GET: async (req, res) => {
    await requireUserId(req)
    const group = req.query?.muscleGroup
    if (group && !GROUPS.includes(group)) throw new HttpError(400, 'Unknown muscle group.', 'BAD_REQUEST')

    const sql = db()
    const rows = group
      ? await sql`SELECT * FROM exercises WHERE muscle_group = ${group} ORDER BY name`
      : await sql`SELECT * FROM exercises ORDER BY array_position(${GROUPS}::text[], muscle_group), name`

    res.status(200).json({
      muscleGroups: GROUPS,
      exercises: rows.map((e) => ({
        id: e.id,
        name: e.name,
        muscleGroup: e.muscle_group,
        sets: e.sets,
        reps: e.reps,
        difficulty: e.difficulty,
        restSeconds: e.rest_seconds,
        description: e.description,
      })),
    })
  },
})
