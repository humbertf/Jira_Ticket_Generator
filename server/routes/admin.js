import { Router } from 'express'
import * as db from '../db.js'

const router = Router()

// Sprints
router.get('/sprints', (req,res)=>{
  res.json(db.getSprints())
})
router.post('/sprints', (req,res)=>{
  const s = req.body
  const created = db.createSprint(s)
  res.status(201).json(created)
})
router.put('/sprints/:id', (req,res)=>{
  const id = Number(req.params.id)
  const updated = db.updateSprint(id, req.body)
  res.json(updated)
})
router.delete('/sprints/:id', (req,res)=>{
  db.deleteSprint(Number(req.params.id))
  res.status(204).end()
})

// Personas
router.get('/personas', (req,res)=> res.json(db.getPersonas()))
router.post('/personas', (req,res)=>{ const p = db.createPersona(req.body); res.status(201).json(p) })
router.put('/personas/:id', (req,res)=>{ const u = db.updatePersona(Number(req.params.id), req.body); res.json(u) })
router.delete('/personas/:id', (req,res)=>{ db.deletePersona(Number(req.params.id)); res.status(204).end() })

// Prefixes
router.get('/prefixes', (req,res)=> res.json(db.getPrefixes()))
router.post('/prefixes', (req,res)=>{ const p = db.createPrefix(req.body); res.status(201).json(p) })
router.put('/prefixes/:id', (req,res)=>{ const u = db.updatePrefix(Number(req.params.id), req.body); res.json(u) })
router.delete('/prefixes/:id', (req,res)=>{ db.deletePrefix(Number(req.params.id)); res.status(204).end() })

// Assignees
router.get('/assignees', (req,res)=> res.json(db.getAssignees()))
router.post('/assignees', (req,res)=>{ const a = db.createAssignee(req.body); res.status(201).json(a) })
router.put('/assignees/:id', (req,res)=>{ const u = db.updateAssignee(Number(req.params.id), req.body); res.json(u) })
router.delete('/assignees/:id', (req,res)=>{ db.deleteAssignee(Number(req.params.id)); res.status(204).end() })

export default router
