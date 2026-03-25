import { Router } from 'express'
import * as db from '../db.js'

const router = Router()

router.get('/', (req,res)=>{
  res.json(db.getStories())
})

router.get('/:id', (req,res)=>{
  const s = db.getStory(Number(req.params.id))
  if(!s) return res.status(404).json({error:'Not found'})
  res.json(s)
})

router.post('/', (req,res)=>{
  const st = req.body
  const created = db.createStory(st)
  res.status(201).json(created)
})

router.put('/:id', (req,res)=>{
  const id = Number(req.params.id)
  const updated = db.updateStory(id, req.body)
  res.json(updated)
})

router.delete('/:id', (req,res)=>{
  db.deleteStory(Number(req.params.id))
  res.status(204).end()
})

// Bulk import stories (JSON) - used by onboarding utility
router.post('/import', (req,res)=>{
  const arr = req.body && req.body.stories
  if(!Array.isArray(arr)) return res.status(400).json({error:'Invalid payload'})
  const created = []
  for(const s of arr){
    created.push(db.createStory(s))
  }
  res.status(201).json({count: created.length, created})
})

export default router
