/* eslint-disable no-undef */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('message_reactions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
          unique: true
        },
        messageId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'messages',
            key: 'id',
          },
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        emoji: {
          type: Sequelize.STRING(255),
          allowNull: false
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
      await queryInterface.dropTable('message_reactions');
    } catch (error) {
      console.log("Migration error", error);
    }
  }
};
