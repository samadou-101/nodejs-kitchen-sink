import { createClient, type RedisClientType } from "redis";

const RedisURL = process.env.REDIS_URL!;
export const redisClient: RedisClientType = createClient({
  url: RedisURL,
});

export async function initRedis() {
  try {
    await redisClient.connect();
    console.log("Redis Server Connected Successfully");
  } catch (error: any) {
    console.log("Error connecting to Redis");
  }
  // redisClient.on("error", (err) => console.log("Redis Client Error"));
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
