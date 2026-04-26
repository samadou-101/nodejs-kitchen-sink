import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);
export async function initRedis() {
  try {
    await redis.set("name", "test");
    await redis.get("name");
    console.log("Redis Connected Successfully");
  } catch (error) {
    console.log("Error Connecting to Redis: ", error);
  }
}
