'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tags', {
      id: Sequelize.INTEGER.UNSIGNED,
      namespace: Sequelize.STRING(64),
      tagName: Sequelize.STRING(64)
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Tags');
  }
};
