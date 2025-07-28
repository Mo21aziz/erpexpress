import { UserService } from "../../users-management/services/user.service";
import { comparePasswords } from "../../utils/hash.util";
import { User, UserWithRole } from "../../../types/user";
import { ConnectPayload, RegisterPayload, AuthResponse } from "../../../types/auth";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AppConfig from "../../config/app.config";

export class AuthService {
  constructor(private userService: UserService) {}

  private async generateTokens(user: UserWithRole): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (!user.role) {
      throw new Error("User role not found");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.role_id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const accessToken = jwt.sign(payload, AppConfig.JWT_SECRET);
    const refreshToken = jwt.sign(payload, AppConfig.JWT_SECRET);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateUser(userId, { refreshToken: hashedToken });
  }

  async connect(payload: ConnectPayload): Promise<AuthResponse> {
    const user = await this.userService.getUserByCondition({
      filter: `email||$eq||${payload.email}`,
    });

    if (!user || !user.password) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await comparePasswords(payload.password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const userWithRole = await this.userService.getUserWithRole(user.id);
    if (!userWithRole) {
      throw new Error("User not found");
    }

    const { accessToken, refreshToken } = await this.generateTokens(userWithRole);
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
  }

  async register(payload: RegisterPayload): Promise<User> {
    const existingUser = await this.userService.getUserByCondition({
      filter: `(username||$eq||${payload.username};email||$eq||${payload.email})`,
    });

    if (existingUser) {
      throw new Error("Username or email already taken");
    }

    // Set default role if not provided
    const role_id = payload.role_id || await this.userService.getDefaultRole();

    return this.userService.createUser({
      ...payload,
      role_id
    });
  }

  async refreshToken(userId: string, refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userService.getUserById(userId);
    if (!user || !user.refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new Error("Invalid refresh token");
    }

    const userWithRole = await this.userService.getUserWithRole(userId);
    if (!userWithRole) {
      throw new Error("User not found");
    }

    const { accessToken, refreshToken: newRefreshToken } = 
      await this.generateTokens(userWithRole);
    await this.saveRefreshToken(userId, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }
}