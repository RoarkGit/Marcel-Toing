export interface StreamChannelData {
  creatorId: string
  open: boolean
  allowedSpeakers: Set<string>
  categoryId: string
  controlsChannelId: string
}
