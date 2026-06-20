import type { Db } from 'mongodb'

const COLLECTION = 'activeStreams'

interface ActiveStreamDoc {
  voiceChannelId: string
  controlsChannelId: string
  categoryId: string
  creatorId: string
  guildId: string
  open: boolean
  allowedSpeakerIds: string[]
  mutedUserIds: string[]
}

export type { ActiveStreamDoc }

export const saveActiveStream = async (
  db: Db,
  data: ActiveStreamDoc,
): Promise<void> => {
  await db
    .collection<ActiveStreamDoc>(COLLECTION)
    .updateOne(
      { voiceChannelId: data.voiceChannelId },
      { $set: data },
      { upsert: true },
    )
}

export const removeActiveStream = async (
  db: Db,
  voiceChannelId: string,
): Promise<void> => {
  await db
    .collection<ActiveStreamDoc>(COLLECTION)
    .deleteOne({ voiceChannelId })
}

export const getAllActiveStreams = async (
  db: Db,
): Promise<ActiveStreamDoc[]> => {
  return db.collection<ActiveStreamDoc>(COLLECTION).find().toArray()
}

export const updateStreamOpenState = async (
  db: Db,
  voiceChannelId: string,
  open: boolean,
  mutedUserIds: string[],
): Promise<void> => {
  await db
    .collection<ActiveStreamDoc>(COLLECTION)
    .updateOne({ voiceChannelId }, { $set: { open, mutedUserIds } })
}

export const addMutedUser = async (
  db: Db,
  voiceChannelId: string,
  userId: string,
): Promise<void> => {
  await db
    .collection<ActiveStreamDoc>(COLLECTION)
    .updateOne(
      { voiceChannelId },
      { $addToSet: { mutedUserIds: userId } },
    )
}

export const removeMutedUser = async (
  db: Db,
  voiceChannelId: string,
  userId: string,
): Promise<void> => {
  await db
    .collection<ActiveStreamDoc>(COLLECTION)
    .updateOne(
      { voiceChannelId },
      { $pull: { mutedUserIds: userId } } as any,
    )
}

export const addAllowedSpeaker = async (
  db: Db,
  voiceChannelId: string,
  userId: string,
): Promise<void> => {
  await db
    .collection<ActiveStreamDoc>(COLLECTION)
    .updateOne(
      { voiceChannelId },
      {
        $addToSet: { allowedSpeakerIds: userId },
        $pull: { mutedUserIds: userId },
      } as any,
    )
}
