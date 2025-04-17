import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import UnauthorizedError from "../exceptions/unauthorized-error";
import jwtPayload from "../jwt/jwt-payload";

// The CustomRequest interface enables us to provide JWTs to our controllers.
export interface CustomRequest extends Request {
  token: JwtPayload;
}

export const authentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = <string>req.headers["authorization"]?.split(" ")[1];
  try {
    const jwt = jwtPayload(req, token);

    (req as CustomRequest).token = jwt;
  } catch (error) {
    console.log("error", error);
    throw new UnauthorizedError("Missing or invalid token");
  }

  // Pass programmatic flow to the next middleware/controller.
  next();
};
