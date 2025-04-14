/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import { AnySchema } from "yup";

export const validateSchema = (schema: AnySchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      next();
    } catch (err: any) {
      if (err.name === "ValidationError") {
        console.table({ error: err.message });
      }
      res.status(400).json({
        message: "Validation failed",
        errors: err.errors,
      });
    }
  };
};
