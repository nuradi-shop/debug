import { MongoClient } from "mongodb"
import { appConfig } from "@/data/config"

const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
}

async function createClient(): Promise<MongoClient> {
  const uri = appConfig.mongodb.uri

  if (!uri) {
    throw new Error("MONGODB_URL belum tersedia.")
  }

  const client = new MongoClient(uri, options)
  return client.connect()
}

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createClient()
  }

  clientPromise = globalWithMongo._mongoClientPromise
} else {
  clientPromise = createClient()
}

export default clientPromise
