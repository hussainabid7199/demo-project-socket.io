/* eslint-disable no-undef */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
          unique: true
        },
        firstName: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        lastName: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        profilePicture: {
          type: Sequelize.BLOB,
          allowNull: true
        },
        ip_address: {
          type: Sequelize.STRING(250),
          allowNull: true
        },
        login_on: {
          type: Sequelize.DATE(7),
          allowNull: true
        },
        lastLoginOn: {
          type: Sequelize.DATE(7),
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE(7),
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
        },
        createdBy: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        updatedAt: {
          type: Sequelize.DATE(7),
          allowNull: true,
        },
        updatedBy: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        isDeleted: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
      });
    } catch (error) {
      console.log("Migration error", error);
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.dropTable('users');
    } catch (error) {
      console.log("Migration error", error);
    }
  }
};
