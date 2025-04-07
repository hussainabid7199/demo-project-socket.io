/* eslint-disable no-undef */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('file_uploads', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        messageId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'messages',
            key: 'id',
          }
        },
        chatId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'messages',
            key: 'chatContactId',
          },
          unique: true
        },
        groupChatId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'messages',
            key: 'groupId',
          },
          unique: true
        },
        chatUserId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'messages',
            key: 'chatContactUserId',
          },
          unique: true
        },
        groupChatUserId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'messages',
            key: 'groupMemberUserId',
          },
          unique: true
        },
        currentUserId: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        fileName: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        fileType: {
          type: Sequelize.STRING(400),
          allowNull: false,
        },
        filePath: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        fileSize: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DataTypes.DATE(7),
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
        },
        createdBy: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        updatedOn: {
          type: Sequelize.DataTypes.DATE(7),
          allowNull: true,
        },
        updatedAt: {
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
        }
      })
    } catch (error) {
      console.log("Migration error", error);
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.dropTable('file_uploads');
    } catch (error) {
      console.log("Migration error", error);
    }
  }
};

