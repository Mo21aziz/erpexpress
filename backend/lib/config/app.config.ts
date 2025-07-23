const isProduction = process.env.NODE_ENV === "production";

const AppConfig = {
  JWT_SECRET: process.env.JWT_SECRET || (isProduction
    ? (() => { throw new Error("JWT_SECRET is required in production"); })()
    : "secret"),
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || "12h",
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || "3d",
};

export default AppConfig;
