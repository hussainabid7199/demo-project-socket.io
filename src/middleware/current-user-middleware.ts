"use strict";
import { Request, Response, NextFunction } from "express";
import { CurrentUserDto } from "../dtos/UserDto";
import { storageContext } from "../context/async-storage-context";
import jwtPayload from "../jwt/jwt-payload";

const CurrentUserContext = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = <string>req.headers["authorization"]?.split(" ")[1];
  if (token) {
    const jwt = jwtPayload(req, token);
    const currentUser = jwt.payload as CurrentUserDto;
    storageContext.run(() => {
      storageContext.set("id", currentUser.id);
      storageContext.set("email", currentUser.email);
      storageContext.set("fullName", currentUser.fullName);
      next();
    });
  } else {
    next();
  }
};

export default CurrentUserContext;
