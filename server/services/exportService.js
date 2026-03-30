import PptxGenJS from 'pptxgenjs'

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function pad2(n){ return n.toString().padStart(2,'0') }

function formatDateForJira(dateObj){
  if(!dateObj) return ''
  const d = new Date(dateObj)
  if(isNaN(d)) return ''
  const day = pad2(d.getDate())
  const month = MONTH_SHORT[d.getMonth()]
  const year = pad2(d.getFullYear() % 100)
  const hours = pad2(d.getHours())
  const minutes = pad2(d.getMinutes())
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

function csvEscape(value){
  if(value === null || value === undefined) return '""'
  const s = value.toString()
  // escape quotes by doubling
  const escaped = s.replace(/"/g,'""')
  return `"${escaped}"`
}

function twoDigitSprint(n){
  const num = Number(n) || 0
  return pad2(num)
}

function buildFullDescription(story){
  const lines = []

  // ── User Story ────────────────────────────────────────────────────────────
  if(story.persona || story.goal || story.benefit){
    lines.push('User Story')
    lines.push('')
    const parts = [story.persona, story.goal, story.benefit].filter(Boolean)
    lines.push(parts.join(', ') + '.')
  }

  // ── Description ───────────────────────────────────────────────────────────
  const desc = (story.jiraDescription || '').trim()
  if(desc){
    lines.push('')
    lines.push('Description')
    lines.push('')
    lines.push(desc)
  }

  // ── Acceptance Criteria ───────────────────────────────────────────────────
  lines.push('')
  lines.push('Acceptance Criteria')
  lines.push('')
  const rawAC = (story.acceptanceCriteria || '').trim()
  if(rawAC){
    rawAC.split('\n').map(c => c.trim()).filter(Boolean).forEach(c => {
      lines.push(c.startsWith('-') ? c : `- ${c}`)
    })
  } else {
    // Auto-generate minimal AC from story context
    const action = story.taskAction || 'the task'
    lines.push(`- The implementation of "${action}" meets the defined requirements.`)
    lines.push('- The change has been tested and verified to work as expected.')
    lines.push('- No existing functionality is negatively impacted.')
  }

  // ── Additional Details ────────────────────────────────────────────────────
  const details = []
  if(story.taskCategory) details.push(`- Task Category: ${story.taskCategory}`)
  if(story.taskType)     details.push(`- Task Type: ${story.taskType}`)
  if(story.taskAction)   details.push(`- Task Action: ${story.taskAction}`)
  const idx = story.sprintIndex ?? story.sprint
  if(idx != null)        details.push(`- Sprint: ${idx}`)
  if(story.assignee)     details.push(`- Assignee: ${story.assignee}`)

  if(details.length > 0){
    lines.push('')
    lines.push('Additional Details')
    lines.push('')
    details.forEach(d => lines.push(d))
  }

  return lines.join('\n')
}

function generateSummary(story){
  const sprintNum = twoDigitSprint(story.sprint)
  const taskCat = (story.taskCategory || '')
  const taskType = (story.taskType || '')
  const taskAction = (story.taskAction || '')

  if(taskType && taskType.toString().trim() !== ''){
    const cat = taskCat.toString().replace(/\s+/g,'').toUpperCase()
    return `SP${sprintNum}:${cat}_${taskType.toString().toUpperCase()}_${taskAction}`
  }
  else{
    return `SP${sprintNum}:${taskCat.toString().toUpperCase()}_${taskAction}`
  }
}

function buildConfig(){
  return {
    "config.version": "2.0",
    "config.project.from.csv": "false",
    "config.encoding": "UTF-8",
    "config.field.mappings": {
      "Assignee": { "jira.field": "assignee" },
      "Issue Type": { "jira.field": "issuetype" },
      "Custom field (Headline)": { "existing.custom.field": "27501" },
      "Description": { "jira.field": "description" },
      "Summary": { "jira.field": "summary" },
      "Custom field (Planned Date)": { "existing.custom.field": "28500" },
      "Sprint": { "existing.custom.field": "11002" },
      "Custom field(Epic Link)": { "existing.custom.field": "11800" },
      "Due Date": { "jira.field": "duedate" }
    },
    "config.value.mappings": {},
    "config.delimiter": ",",
    "config.project": {
      "project.type": null,
      "project.key": "DAG",
      "project.description": null,
      "project.url": null,
      "project.name": "Data Governance",
      "project.lead": "turan"
    },
    "config.date.format": "dd/MMM/yy HH:mm",
    "config.create.and.assign.default.project.role": "false"
  }
}

export function validateExportInput({stories, sprints}){
  const errors = []
  if(!Array.isArray(stories) || stories.length===0) errors.push('No stories provided')
  if(!Array.isArray(sprints)) errors.push('Sprints metadata missing')
  return errors
}

export function generateCsv({stories, sprints}){
  const sprintMap = new Map()
  for(const s of sprints){
    const idx = s.SprintIndex ?? s.Sprint_Index ?? s.sprintIndex ?? s.sprint
    if(idx !== undefined) sprintMap.set(Number(idx), s)
  }

  const rows = []
  const header = ["Summary","Custom field (Headline)","Description","Custom field(Epic Link)","Issue Type","Sprint","Assignee","Custom field (Planned Date)","Due Date"]
  rows.push(header.map(csvEscape).join(','))

  for(const st of stories){
    const sprintIdx = Number(st.sprint)
    const sprintRec = sprintMap.get(sprintIdx)
    const summary = generateSummary(st)
    const headline = summary
    const description = buildFullDescription(st)
    const epicName = sprintRec ? (sprintRec.EpicName ?? sprintRec.Epic_Name ?? sprintRec.epicName ?? '') : ''
    const issueType = 'Story'
    const sprintId = sprintRec ? (sprintRec.SprintID ?? sprintRec.Sprint_ID ?? sprintRec.sprintId ?? sprintRec.Sprint_Id ?? '') : ''
    const assignee = st.assignee ?? ''
    let plannedDate = ''
    let dueDate = ''
    if(sprintRec){
      if(sprintRec.Start_Date) plannedDate = formatDateForJira(sprintRec.Start_Date)
      else if(sprintRec.Start_Month && sprintRec.Start_Day && sprintRec.Start_Year){
        const sd = new Date(Number(sprintRec.Start_Year), Number(sprintRec.Start_Month)-1, Number(sprintRec.Start_Day),0,0,0)
        plannedDate = formatDateForJira(sd)
      }

      if(sprintRec.End_Date) dueDate = formatDateForJira(sprintRec.End_Date)
      else if(sprintRec.End_Month && sprintRec.End_Day && sprintRec.End_Year){
        const ed = new Date(Number(sprintRec.End_Year), Number(sprintRec.End_Month)-1, Number(sprintRec.End_Day),0,0,0)
        dueDate = formatDateForJira(ed)
      }
    }

    const row = [summary, headline, description, epicName, issueType, sprintId, assignee, plannedDate, dueDate]
    rows.push(row.map(csvEscape).join(','))
  }

  return rows.join('\r\n') + '\r\n'
}

export function generateConfigFile(){
  const cfg = buildConfig()
  return JSON.stringify(cfg, null, 2)
}

export async function generatePptx({ stories, sprints }){
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'  // 13.33" x 7.5"

  const RED        = 'EB1000'
  const BLACK      = '1E1E1E'
  const WHITE      = 'FFFFFF'
  const GRAY       = '767676'
  const LIGHT_GRAY = 'F4F4F4'
  const W          = 13.33
  const H          = 7.5
  const STRIPE_W   = 0.18
  const ML         = 0.45  // margin left (after stripe)
  const MR         = 0.4   // margin right
  const CX         = STRIPE_W + ML
  const CW         = W - CX - MR

  // Sprint lookup map
  const sprintMap = new Map()
  for(const s of sprints){
    const idx = s.SprintIndex ?? s.Sprint_Index ?? s.sprintIndex ?? s.sprint
    if(idx !== undefined) sprintMap.set(Number(idx), s)
  }

  // ── Cover slide ────────────────────────────────────────────────────────────
  const cover = pptx.addSlide()
  cover.background = { color: RED }

  cover.addText('Adobe', {
    x: 0.55, y: 0.4, w: 3, h: 0.7,
    fontSize: 32, bold: true, color: WHITE, fontFace: 'Calibri',
  })

  cover.addText('Jira User Stories', {
    x: 0.55, y: 1.9, w: W - 1.1, h: 1.3,
    fontSize: 52, bold: true, color: WHITE, fontFace: 'Calibri',
  })

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  cover.addText(`${stories.length} User ${stories.length === 1 ? 'Story' : 'Stories'}  ·  ${today}`, {
    x: 0.55, y: 3.35, w: W - 1.1, h: 0.5,
    fontSize: 18, color: WHITE, fontFace: 'Calibri',
  })

  // White bottom bar
  cover.addShape('rect', {
    x: 0, y: H - 0.12, w: W, h: 0.12,
    fill: { color: WHITE }, line: { type: 'none' },
  })

  // ── One slide per story ────────────────────────────────────────────────────
  for(const st of stories){
    const sprintIdx = Number(st.sprint ?? st.sprintIndex ?? 0)
    const sprintRec = sprintMap.get(sprintIdx)

    const slide = pptx.addSlide()
    slide.background = { color: WHITE }

    // Left red stripe
    slide.addShape('rect', {
      x: 0, y: 0, w: STRIPE_W, h: H,
      fill: { color: RED }, line: { type: 'none' },
    })

    // ── Tag row ──────────────────────────────────────────────────────────────
    const sprintLabel = `SP${String(sprintIdx).padStart(2, '0')}`
    const catLabel    = (st.taskCategory || '').toUpperCase()
    const typeLabel   = (st.taskType     || '').toUpperCase()
    const TAG_Y = 0.22
    const TAG_H = 0.28
    const FS    = 9
    let tx = CX

    // Sprint pill — red
    const spW = 0.58
    slide.addShape('rect', { x: tx, y: TAG_Y, w: spW, h: TAG_H, fill: { color: RED }, line: { type: 'none' } })
    slide.addText(sprintLabel, { x: tx, y: TAG_Y, w: spW, h: TAG_H, fontSize: FS, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' })
    tx += spW + 0.1

    // Category pill — black
    if(catLabel){
      const catW = Math.max(0.55, catLabel.length * 0.095 + 0.22)
      slide.addShape('rect', { x: tx, y: TAG_Y, w: catW, h: TAG_H, fill: { color: BLACK }, line: { type: 'none' } })
      slide.addText(catLabel, { x: tx, y: TAG_Y, w: catW, h: TAG_H, fontSize: FS, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' })
      tx += catW + 0.1
    }

    // Type pill — light gray border
    if(typeLabel){
      const typeW = Math.max(0.6, typeLabel.length * 0.095 + 0.22)
      slide.addShape('rect', { x: tx, y: TAG_Y, w: typeW, h: TAG_H, fill: { color: LIGHT_GRAY }, line: { color: 'CCCCCC', pt: 0.5 } })
      slide.addText(typeLabel, { x: tx, y: TAG_Y, w: typeW, h: TAG_H, fontSize: FS, color: BLACK, fontFace: 'Calibri', align: 'center', valign: 'middle' })
    }

    // Summary (mono, small, gray)
    const summaryText = st.summary || generateSummary(st)
    slide.addText(summaryText, {
      x: CX, y: 0.58, w: CW, h: 0.22,
      fontSize: 8.5, color: GRAY, fontFace: 'Courier New',
    })

    // Main title: taskAction
    slide.addText(st.taskAction || '(no action defined)', {
      x: CX, y: 0.84, w: CW, h: 0.76,
      fontSize: 22, bold: true, color: BLACK, fontFace: 'Calibri',
      wrap: true, valign: 'top',
    })

    // Divider
    slide.addShape('line', {
      x: CX, y: 1.66, w: CW, h: 0,
      line: { color: 'E0E0E0', pt: 0.75 },
    })

    // ── Content sections ─────────────────────────────────────────────────────
    let curY = 1.78
    const LABEL_FS = 8
    const BODY_FS  = 10
    const LABEL_H  = 0.2
    const LINE_H   = 0.175
    const SEC_GAP  = 0.14

    function addSection(label, text){
      if(!text || !text.trim()) return
      slide.addText(label.toUpperCase(), {
        x: CX, y: curY, w: CW, h: LABEL_H,
        fontSize: LABEL_FS, bold: true, color: RED,
        fontFace: 'Calibri', charSpacing: 0.5,
      })
      curY += LABEL_H

      const bodyLines = text.trim().split('\n').filter(l => l.trim())
      const estLines  = bodyLines.reduce((acc, l) => acc + Math.ceil(l.length / 95), 0)
      const bodyH     = Math.max(LINE_H, estLines * LINE_H)

      slide.addText(text.trim(), {
        x: CX, y: curY, w: CW, h: bodyH,
        fontSize: BODY_FS, color: BLACK, fontFace: 'Calibri',
        wrap: true, valign: 'top',
      })
      curY += bodyH + SEC_GAP
    }

    // User Story
    if(st.persona || st.goal || st.benefit){
      const parts = [st.persona, st.goal, st.benefit].filter(Boolean)
      addSection('User Story', parts.join(', ') + '.')
    }

    // Description
    if((st.jiraDescription || '').trim()){
      addSection('Description', st.jiraDescription.trim())
    }

    // Acceptance Criteria
    const rawAC = (st.acceptanceCriteria || '').trim()
    let acText
    if(rawAC){
      acText = rawAC.split('\n').map(c => c.trim()).filter(Boolean)
        .map(c => c.startsWith('-') || c.startsWith('•') ? c : `• ${c}`).join('\n')
    } else {
      const action = st.taskAction || 'the task'
      acText = `• The implementation of "${action}" meets the defined requirements.\n• The change has been tested and verified to work as expected.\n• No existing functionality is negatively impacted.`
    }
    addSection('Acceptance Criteria', acText)

    // ── Footer ────────────────────────────────────────────────────────────────
    const FY = H - 0.32
    slide.addShape('line', {
      x: CX, y: FY - 0.06, w: CW, h: 0,
      line: { color: 'E0E0E0', pt: 0.5 },
    })

    if(st.assignee){
      slide.addText(`Assignee: ${st.assignee}`, {
        x: CX, y: FY, w: CW / 2, h: 0.22,
        fontSize: 8, color: GRAY, fontFace: 'Calibri',
      })
    }

    if(sprintRec){
      const sm = sprintRec.Start_Month, sd2 = sprintRec.Start_Day, sy = sprintRec.Start_Year
      const em = sprintRec.End_Month,   ed2 = sprintRec.End_Day,   ey = sprintRec.End_Year
      if(sm && sd2 && sy && em && ed2 && ey){
        const dateRange = `${MONTH_SHORT[sm-1]} ${sd2}, ${sy} – ${MONTH_SHORT[em-1]} ${ed2}, ${ey}`
        slide.addText(dateRange, {
          x: CX + CW / 2, y: FY, w: CW / 2, h: 0.22,
          fontSize: 8, color: GRAY, fontFace: 'Calibri', align: 'right',
        })
      }
    }
  }

  return pptx.write({ outputType: 'base64' })
}
