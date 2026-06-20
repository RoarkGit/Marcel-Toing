import { type Db, MongoClient } from 'mongodb'

let db: Db

export const connectDb = async (uri: string): Promise<Db> => {
  const client = new MongoClient(uri)
  await client.connect()
  db = client.db()
  return db
}

export const getDb = (): Db => db
