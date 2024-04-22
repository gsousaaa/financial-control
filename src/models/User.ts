import { Model, DataTypes, HasMany } from 'sequelize';
import { sequelize } from '../instances/mysql';
import { Movement } from './Movement';

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
        type: DataTypes.STRING,
        unique: true
    },
    passwordHash: {
        allowNull: false,
        type: DataTypes.STRING
    }, 
    saldo: {
        allowNull: true, 
        defaultValue: 0,
        type: DataTypes.FLOAT
    }

}, {
        tableName: 'users',
        timestamps: false
})

User.hasMany(Movement, ({foreignKey: 'user_id'}))
Movement.belongsTo(User, ({foreignKey: 'user_id'}))


sequelize.sync()
    .then(() => {
        
    })
    .catch(error => {
        console.log(error)
    })


