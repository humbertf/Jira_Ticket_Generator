import { Router } from 'express'
import { validateExportInput, generateCsv, generateConfigFile, generatePptx } from '../services/exportService.js'

const router = Router()

// POST /api/export
// body: { stories: [...], sprints: [...] }
router.post('/export', async (req, res) => {
  const { stories, sprints } = req.body || {}
  const errors = validateExportInput({stories, sprints})
  if(errors.length) return res.status(400).json({ errors })

  try{
    const [csv, pptx] = await Promise.all([
      generateCsv({stories, sprints}),
      generatePptx({stories, sprints}),
    ])
    const config    = generateConfigFile()
    const timestamp = new Date().toISOString().replace(/[:.]/g,'').slice(0,15)
    const csvFilename  = `jira_export_${timestamp}.csv`
    const cfgFilename  = `jira_config_${timestamp}.txt`
    const pptxFilename = `jira_stories_${timestamp}.pptx`
    return res.json({ csv, config, pptx, csvFilename, cfgFilename, pptxFilename, rowCount: stories.length })
  }catch(err){
    console.error('Export error', err)
    return res.status(500).json({ error: 'Export failed', detail: err.message })
  }
})

export default router
