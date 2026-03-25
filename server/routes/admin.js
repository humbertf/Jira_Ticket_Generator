import { Router } from 'express'
import db from '../db.js'

const router = Router()

// ── Sprints ───────────────────────────────────────────────────────────────────
router.get('/sprints', async (req, res) => {
  try {
    const sprints = await db.sprint.findMany({ orderBy: { sprintIndex: 'asc' } })
    res.json(sprints)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/sprints', async (req, res) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, stories: ____, ...data } = req.body
    const sprint = await db.sprint.create({ data })
    res.status(201).json(sprint)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/sprints/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { id: _, createdAt: __, updatedAt: ___, stories: ____, ...data } = req.body
    const sprint = await db.sprint.update({ where: { id }, data })
    res.json(sprint)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/sprints/:id', async (req, res) => {
  try {
    await db.sprint.delete({ where: { id: parseInt(req.params.id) } })
    res.status(204).end()
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── Personas ──────────────────────────────────────────────────────────────────
router.get('/personas', async (req, res) => {
  try {
    const personas = await db.persona.findMany({ orderBy: { sortOrder: 'asc' } })
    res.json(personas)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/personas', async (req, res) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, ...data } = req.body
    const persona = await db.persona.create({ data })
    res.status(201).json(persona)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/personas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { id: _, createdAt: __, updatedAt: ___, ...data } = req.body
    const persona = await db.persona.update({ where: { id }, data })
    res.json(persona)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/personas/:id', async (req, res) => {
  try {
    await db.persona.delete({ where: { id: parseInt(req.params.id) } })
    res.status(204).end()
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── Prefixes ──────────────────────────────────────────────────────────────────
router.get('/prefixes', async (req, res) => {
  try {
    const prefixes = await db.prefix.findMany({ orderBy: { sortOrder: 'asc' } })
    res.json(prefixes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/prefixes', async (req, res) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, ...data } = req.body
    const prefix = await db.prefix.create({ data })
    res.status(201).json(prefix)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/prefixes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { id: _, createdAt: __, updatedAt: ___, ...data } = req.body
    const prefix = await db.prefix.update({ where: { id }, data })
    res.json(prefix)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/prefixes/:id', async (req, res) => {
  try {
    await db.prefix.delete({ where: { id: parseInt(req.params.id) } })
    res.status(204).end()
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── Assignees ─────────────────────────────────────────────────────────────────
router.get('/assignees', async (req, res) => {
  try {
    const assignees = await db.assignee.findMany({ orderBy: { username: 'asc' } })
    res.json(assignees)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/assignees', async (req, res) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, ...data } = req.body
    const assignee = await db.assignee.create({ data })
    res.status(201).json(assignee)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/assignees/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { id: _, createdAt: __, updatedAt: ___, ...data } = req.body
    const assignee = await db.assignee.update({ where: { id }, data })
    res.json(assignee)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/assignees/:id', async (req, res) => {
  try {
    await db.assignee.delete({ where: { id: parseInt(req.params.id) } })
    res.status(204).end()
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── Components ────────────────────────────────────────────────────────────────
router.get('/components', async (req, res) => {
  try {
    const components = await db.component.findMany({ orderBy: { sortOrder: 'asc' } })
    res.json(components)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/components', async (req, res) => {
  try {
    const { id: _, createdAt: __, updatedAt: ___, ...data } = req.body
    const component = await db.component.create({ data })
    res.status(201).json(component)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/components/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { id: _, createdAt: __, updatedAt: ___, ...data } = req.body
    const component = await db.component.update({ where: { id }, data })
    res.json(component)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/components/:id', async (req, res) => {
  try {
    await db.component.delete({ where: { id: parseInt(req.params.id) } })
    res.status(204).end()
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
