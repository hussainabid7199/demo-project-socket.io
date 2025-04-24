"use-strict";
import { Request, Response } from "express";
import {
  controller,
  httpGet,
  interfaces,
  request,
  response,
} from "inversify-express-utils";
import { authentication } from "../middleware/authentication.middleware";
import ErrorLoggerModel from "../database/models/ErrorLoggerModel";
import ErrorDto from "../dtos/ErrorDto";

@controller("/error")
export class ErrorController implements interfaces.Controller {
  
  @httpGet("/", authentication)
  public async error(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<ErrorDto>> {
    try {
      const response = await ErrorLoggerModel.findAll({
        order: [["createdAt", "DESC"]],
      }) as unknown as ErrorDto;

      if (!response) {
        return res.status(400).json({
          success: false,
          message: "Some error occurred while fetching the errors",
        });
      }

      if (response) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "Internal server error",
      });
    }
  }
}
