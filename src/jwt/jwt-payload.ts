import { Request } from "express";
import { verify } from "jsonwebtoken";
import config from "../jwt/jwt-config";

const jwtPayload = (req: Request, token:string) => {
  // Get the JWT from the request header.
  const jwt_Payload = verify(token, config.jwt.secret!, {
    complete: true,
    audience: config.jwt.audience,
    issuer: config.jwt.issuer,
    algorithms: ["HS256"],
    clockTolerance: 0,
    ignoreExpiration: false,
    ignoreNotBefore: false,
  });
  // Add the payload to the request so controllers may access it.
  return jwt_Payload;
};


export default jwtPayload;