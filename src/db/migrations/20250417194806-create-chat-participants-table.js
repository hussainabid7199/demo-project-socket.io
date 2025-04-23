/* eslint-disable no-undef */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('chat_participants', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        chatId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'chats',
            key: 'id',
          },
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        isAdmin: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        isAdminMsg: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        isMuted: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        isArchived: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        leaveGroup: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        removeGroup: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        isBlocked: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        blockedBy: {
          type: Sequelize.INTEGER,
          allowNull: true,
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
      await queryInterface.dropTable('chat_participants');
    } catch (error) {
      console.log("Migration error", error);
    }
  }
};
