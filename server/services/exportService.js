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
    const description = st.description ?? st.jiraDescription ?? ''
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
