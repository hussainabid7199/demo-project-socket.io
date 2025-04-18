/* eslint-disable no-undef */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('messages', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
          unique: true
        },
        chatId: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          references: {
            model: 'chats',
            key: 'id',
          },
        },
        senderId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
              model: 'users',
              key: 'id',
            },
        },
        message: {
          type: Sequelize.TEXT(),
          allowNull: false,
        },
        messageType: {
          type: Sequelize.ENUM("TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE"),
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DataTypes.DATE(7),
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
        },
        createdBy: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DataTypes.DATE(7),
          allowNull: true,
        },
        updatedBy: {
          type: Sequelize.STRING(255),
          allowNull: true,
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
      await queryInterface.dropTable('messages');
    } catch (error) {
      console.log("Migration error", error);
    }
  },
};

