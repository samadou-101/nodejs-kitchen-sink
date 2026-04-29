import { createClient } from "redis";

export async function initRedis() {
  const RedisURL = process.env.REDIS_URL;
  const client = createClient({
    url: RedisURL,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  try {
    await client.connect();
    console.log("Redis Server Connected Successfully");
  } catch (error: any) {
    console.log("Error connecting to Redis", error.message);
  }
}

// import Redis from "ioredis";

// const redis = new Redis(process.env.REDIS_URL);
// export async function initRedis() {
//   try {
//     await redis.set("name", "test");
//     await redis.get("name");
//     console.log("Redis Connected Successfully");
//   } catch (error) {
//     console.log("Error Connecting to Redis: ", error);
//   }
// }
