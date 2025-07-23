import { UserService } from "../../users-management/services/user.service.ts";
import { comparePasswords } from "../../utils/hash.util.ts";
import { User } from "../../../types/user.ts";
import { ConnectPayload, RegisterPayload } from "../../../types/auth.ts";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AppConfig from "../../config/app.config.ts";

export class AuthService {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  private async generateTokens(user: User) {
    try {
      const userWithRole = await this.userService.getUserWithRole(user.id);

      if (!userWithRole) {
        console.error("Failed to fetch user with role:", user.id);
        throw new Error("User not found");
      }

      if (!userWithRole.role) {
        console.error("User has no role assigned:", user.id);
        throw new Error("User role not found");
      }

      const payload = {
        sub: user.id,
        email: user.email,
        roleId: userWithRole.role_id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      };

      console.debug("Generating tokens for user:", {
        userId: user.id,
        roleId: userWithRole.role_id,
        tokenExpiration: new Date(payload.exp * 1000).toISOString(),
      });

      const accessToken = jwt.sign(payload, AppConfig.JWT_SECRET);
      const refreshToken = jwt.sign(payload, AppConfig.JWT_SECRET);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Token generation failed:", error);
      throw new Error("Failed to generate authentication tokens");
    }
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    try {
      const hashedToken = await bcrypt.hash(refreshToken, 10);
      await this.userService.updateUser(userId, { refreshToken: hashedToken });
    } catch (error) {
      console.error("Failed to save refresh token:", error);
      throw new Error("Failed to save authentication token");
    }
  }

  async connect(payload: ConnectPayload) {
    try {
      console.debug("Attempting to connect user:", payload.email);

      // First try to find user by email only
      const user = await this.userService.getUserByCondition({
        filter: `email||$eq||${payload.email}`,
      });

      if (!user) {
        console.debug("User not found with email:", payload.email);
        throw new Error("Invalid credentials");
      }

      console.debug("User found:", user.id);

      if (!user.password) {
        console.error("User has no password set:", user.id);
        throw new Error("Invalid credentials");
      }

      console.debug("Comparing passwords...");
      const isMatch = await comparePasswords(payload.password, user.password);
      if (!isMatch) {
        console.debug("Password mismatch for user:", user.id);
        throw new Error("Invalid credentials");
      }

      console.debug("User authenticated successfully:", user.id);

      const { accessToken, refreshToken } = await this.generateTokens(user);
      await this.saveRefreshToken(user.id, refreshToken);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role_id: user.role_id,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error("Connection failed:", error);
      throw error; // Re-throw the original error with its message
    }
  }

  async register(payload: RegisterPayload) {
    try {
      console.debug("Attempting to register new user:", payload.email);

      const existingUser = await this.userService.getUserByCondition({
        filter: `(username||$eq||${payload.username};email||$eq||${payload.email})`,
      });

      if (existingUser) {
        console.debug("User already exists:", {
          email: payload.email,
          username: payload.username,
        });
        throw new Error("Username or email already taken");
      }

      const user = await this.userService.createUser(payload);
      console.debug("User registered successfully:", user.id);

      return user;
    } catch (error) {
      console.error("Registration failed:", error);
      throw new Error("Failed to register user");
    }
  }

  async refreshToken(userId: string, refreshToken: string) {
    try {
      console.debug("Attempting to refresh token for user:", userId);

      const user = await this.userService.getUserById(userId);
      if (!user || !user.refreshToken) {
        console.debug(
          "Invalid refresh token - user not found or no refresh token:",
          userId
        );
        throw new Error("Invalid refresh token");
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        console.debug("Invalid refresh token - token mismatch:", userId);
        throw new Error("Invalid refresh token");
      }

      console.debug("Refresh token validated successfully:", userId);

      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(user);
      await this.saveRefreshToken(user.id, newRefreshToken);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw new Error("Failed to refresh authentication tokens");
    }
  }
}
