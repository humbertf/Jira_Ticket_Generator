"use client"

import { useParams } from "next/navigation"
import { StoryEditor } from "@/components/stories/StoryEditor"

export default function EditStoryPage() {
  const params = useParams()
  const id = parseInt(params.id as string)
  return <StoryEditor storyId={id} />
}
