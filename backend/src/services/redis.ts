import IORedis from 'ioredis';

const redis = new IORedis(6432, '127.0.0.1');

export default redis;
