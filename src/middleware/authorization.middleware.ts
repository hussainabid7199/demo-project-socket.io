import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from './authentication.middleware';
// import { Roles } from '../enums/role.enum';
import NotFoundError from '../exceptions/not-found-error';
import ForbiddenError from '../exceptions/forbidden-error';
// import { RoleModel } from '../database/models/RoleModel';
// roles: Array<Roles>
export const authorization = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Find the user with the requested ID.
      // const uniqueId = (req as CustomRequest).token.payload.roleUniqueId || '';
      const isActive = (req as CustomRequest).token.payload.user.isActive || false;

      // const rolesResponse = await RoleModel.findOne({
      //   where: {
      //     uniqueId: uniqueId,
      //   },
      //   raw: true,
      // });

      // Ensure we found a user.
      if (!isActive) {
        throw new NotFoundError('User not found');
      }
      
      // const hasMatchingRole = roles.includes(rolesResponse?.roleName as Roles);

      // if (hasMatchingRole) {
      //   next();
      // } else {
      //   throw new ForbiddenError('Not enough permissions');
      // }
      next();
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        res.status(error.status).json({ message: error.message });
      } else {
        // Handle other unexpected errors
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };
};

