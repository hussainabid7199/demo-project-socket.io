import * as jwt from "jsonwebtoken";
import config from "./jwt-config";
import { CurrentUserDto } from "../dtos/UserDto";

const generateToken = async (user: CurrentUserDto,
  expireIn: number = 15552000
): Promise<string> => {
  const jwtSecret = config.jwt.secret;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  
  const token = await jwt.sign(
    {
      id: user.id,
      guid: user.guid,
      email: user.email,
      fullName: user.fullName
    },
    jwtSecret,
    {
      expiresIn: expireIn,
      algorithm: "HS256",
      audience: config.jwt.audience,
      issuer: config.jwt.issuer,
    }
  );

  return token;
};

export default generateToken;
