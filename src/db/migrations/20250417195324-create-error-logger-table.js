/* eslint-disable no-undef */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('error-loggers', 
        { 
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
            unique: true
          },
          error: {
            type: Sequelize.TEXT(),
            allowNull: false
          },
          errorType: {
            type: Sequelize.STRING(255),
            allowNull: false
          },
          errorCode: {
            type: Sequelize.STRING(255),
            allowNull: false
          },
          createdAt: {
            type: Sequelize.DataTypes.DATE(7),
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
          },
        }
      );
    } catch (error) {
      console.log("Migration error", error)
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.dropTable('error-loggers');
    } catch (error) {
      console.log("Migration error", error);
    }
  }
};
