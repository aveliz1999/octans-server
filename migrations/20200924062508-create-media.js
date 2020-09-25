'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Media', {
      id: Sequelize.INTEGER.UNSIGNED,
      hash: Sequelize.CHAR(64),
      mediaType: Sequelize.STRING,
      width: Sequelize.SMALLINT.UNSIGNED,
      height: Sequelize.SMALLINT.UNSIGNED,
      duration: Sequelize.SMALLINT.UNSIGNED,
      size: Sequelize.BIGINT.UNSIGNED,
      createdAt: Sequelize.DATE(3),
      updatedAt: Sequelize.DATE(3),
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('Media');
  }
};
