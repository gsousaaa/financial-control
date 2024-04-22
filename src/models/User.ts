import { Model, DataTypes } from 'sequelize';

import { sequelize } from '../instances/mysql';

export interface UserInstance extends Model {
    id: number,
    name: string,
    email: string, 
    passwordHash: string,
    saldo: number
}


export const User = sequelize.define<UserInstance>('User', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },

    name: {
        allowNull: false,
        type: DataTypes.STRING
    }, 
    email: {
        allowNull: false,
        type: DataTypes.STRING
    },
    passwordHash: {
        allowNull: false,
        type: DataTypes.STRING
    }, 
    saldo: {
        allowNull: false, 
        type: DataTypes.FLOAT
    }

}, {
        tableName: 'users',
        timestamps: false
})