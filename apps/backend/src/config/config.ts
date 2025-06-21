// This file is used to store the configuration for the application

export const config = {
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
    MAX_COLLISION_RETRIES: Number(process.env.MAX_COLLISION_RETRIES) || 5,
    GENERATED_SLUG_LENGTH: Number(process.env.GENERATED_SLUG_LENGTH) || 7,
}