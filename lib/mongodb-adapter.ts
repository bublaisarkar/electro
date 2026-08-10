import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const options = {};

interface Global {
  _mongoClientPromise?: Promise<MongoClient>;
}

// Declare the global variable (within this module)
declare const global: Global;

const cached = global;

if (!cached._mongoClientPromise) {
  const client = new MongoClient(uri, options);
  cached._mongoClientPromise = client.connect();
}

const clientPromise: Promise<MongoClient> = cached._mongoClientPromise!;

export default clientPromise;