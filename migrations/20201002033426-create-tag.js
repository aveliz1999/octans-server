'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      namespace: Sequelize.STRING(64),
      tagName: Sequelize.STRING(64),
      createdAt: Sequelize.DATE(3),
      updatedAt: Sequelize.DATE(3),
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Tags');
  }
};
