/* eslint-disable no-undef */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('last_seen_records', 
        { 
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id',
            },
          },
          status: {
            type: Sequelize.STRING(50),
            allowNull: false,
          },
          lastSeenOn: {
            type: Sequelize.DataTypes.DATE(7),
            allowNull: true,
          },
          createdAt: {
            type: Sequelize.DataTypes.DATE(7),
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DataTypes.DATE(7),
            allowNull: true,
          },
        }
      
      );
    } catch (error) {
      console.log("Migration error", error)
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.dropTable('last_seen_records');
    } catch (error) {
      console.log("Migration error", error);
    }
  }
};
