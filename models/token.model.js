module.exports = (sequelize, DataTypes) => {
    const Token = sequelize.define("token", {
        token: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });

    return Token;
};
