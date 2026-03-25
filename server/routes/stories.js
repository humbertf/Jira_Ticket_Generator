import { Router } from 'express'
import db from '../db.js'

const router = Router()

function buildSummary(story) {
  const sprint = String(story.sprintIndex || '').padStart(2, '0')
  const cat    = (story.taskCategory || '').toUpperCase()
  const type   = story.taskType?.trim() ? `_${story.taskType.toUpperCase()}` : ''
  return `SP${sprint}:${cat}${type}_${story.taskAction || ''}`
}

// POST /api/stories/import — must be defined before /:id to avoid route conflict
router.post('/import', async (req, res) => {
  try {
    const arr = req.body?.stories
    if (!Array.isArray(arr)) return res.status(400).json({ error: 'Invalid payload — expected { stories: [] }' })
    const created = []
    for (const s of arr) {
      const { id: _, createdAt: __, updatedAt: ___, sprint: ____, ...data } = s
      if (!data.summary) data.summary = buildSummary(data)
      if (!data.headline) data.headline = data.summary
      created.push(await db.story.create({ data }))
    }
    res.status(201).json({ count: created.length, created })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const stories = await db.story.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(stories)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const story = await db.story.findUnique({ where: { id: parseInt(req.params.id) } })
    if (!story) return res.status(404).json({ error: 'Not found' })
    res.json(story)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, sprint: ____, ...data } = req.body
    if (!data.summary) data.summary = buildSummary(data)
    if (!data.headline) data.headline = data.summary
    const story = await db.story.create({ data })
    res.status(201).json(story)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { id: _, createdAt: __, updatedAt: ___, sprint: ____, ...data } = req.body
    const story = await db.story.update({ where: { id }, data })
    res.json(story)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await db.story.delete({ where: { id: parseInt(req.params.id) } })
    res.status(204).end()
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
