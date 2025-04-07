import * as jwt from "jsonwebtoken";
import config from "./jwt-config";

const generateToken = async (
  email: string,
  guid: string,
  expireIn: number = 15552000
): Promise<string> => {
  const jwtSecret = config.jwt.secret;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  
  const token = await jwt.sign(
    {
      guid: guid,
      email: email,
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
