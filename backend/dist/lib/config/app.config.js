const isProduction = process.env.NODE_ENV === "production";
const AppConfig = {
    JWT_SECRET: process.env.JWT_SECRET || "fallback-secret-key-for-development",
    JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || "3h",
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || "7d",
};
export default AppConfig;
