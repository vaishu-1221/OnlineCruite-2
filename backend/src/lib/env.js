import dotenv from 'dotenv'


dotenv.config({quiet: true});

export const ENV={
    PORT: process.env.PORT,
    MONGODB_URL: process.env.MONGODB_URL,
    NODE_ENV:process.env.NODE_ENV,
}