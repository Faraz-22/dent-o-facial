import { MongoClient } from 'mongodb'

async function check() {
  const uri = 'mongodb+srv://admin:admin123@cluster0.z2z0l.mongodb.net/dentofacial?retryWrites=true&w=majority' // I need to get the real URI from .env.local
  const client = new MongoClient(process.env.MONGODB_URI as string)
  await client.connect()
  const db = client.db()
  const content = await db.collection('sitecontents').findOne({ id: 'main' })
  console.log(JSON.stringify(content?.results, null, 2))
  process.exit(0)
}
check()
