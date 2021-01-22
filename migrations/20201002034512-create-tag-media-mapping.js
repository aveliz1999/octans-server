'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('TagMediaMappings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },      tagId: Sequelize.INTEGER.UNSIGNED,
      mediaId: Sequelize.INTEGER.UNSIGNED,
      createdAt: Sequelize.DATE(3),
      updatedAt: Sequelize.DATE(3),
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('TagMediaMappingsTagMediaMappings');
  }
};
