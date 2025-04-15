/* eslint-disable no-undef */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('messages', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        chatContactId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'chat_contacts',
            key: 'id',
          },
        },
        groupId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'groups',
            key: 'id',
          },
        },
        groupMemberId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'group_members',
            key: 'id',
          }
        },
        currentUserId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        message: {
          type: Sequelize.STRING(50),
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

