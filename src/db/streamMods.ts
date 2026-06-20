import type { Db } from 'mongodb'

interface StreamModDoc {
  creatorId: string
  mods: string[]
}

const COLLECTION = 'streamMods'

export const getStreamMods = async (
  db: Db,
  creatorId: string,
): Promise<string[]> => {
  const doc = await db
    .collection<StreamModDoc>(COLLECTION)
    .findOne({ creatorId })
  return doc?.mods ?? []
}

export const addStreamMod = async (
  db: Db,
  creatorId: string,
  modId: string,
): Promise<void> => {
  await db
    .collection<StreamModDoc>(COLLECTION)
    .updateOne(
      { creatorId },
      { $addToSet: { mods: modId } },
      { upsert: true },
    )
}

export const removeStreamMod = async (
  db: Db,
  creatorId: string,
  modId: string,
): Promise<void> => {
  await db
    .collection<StreamModDoc>(COLLECTION)
    .updateOne({ creatorId }, { $pull: { mods: modId } } as any)
}

export const setStreamMods = async (
  db: Db,
  creatorId: string,
  modIds: string[],
): Promise<void> => {
  await db
    .collection<StreamModDoc>(COLLECTION)
    .updateOne(
      { creatorId },
      { $set: { mods: modIds } },
      { upsert: true },
    )
}

export const isStreamMod = async (
  db: Db,
  creatorId: string,
  memberId: string,
): Promise<boolean> => {
  const doc = await db
    .collection<StreamModDoc>(COLLECTION)
    .findOne({ creatorId, mods: memberId })
  return doc !== null
}
