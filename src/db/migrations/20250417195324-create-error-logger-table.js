/* eslint-disable no-undef */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('error_loggers',
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
          },
          error: {
            type: Sequelize.TEXT(),
            allowNull: true
          },
          errorType: {
            type: Sequelize.STRING(255),
            allowNull: true
          },
          errorCode: {
            type: Sequelize.STRING(255),
            allowNull: true
          },
          requestType: {
            type: Sequelize.TEXT(),
            allowNull: true
          },
          ipAddress: {
            type: Sequelize.STRING(250),
            allowNull: true
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
      await queryInterface.dropTable('error_loggers');
    } catch (error) {
      console.log("Migration error", error);
    }
  }
};
