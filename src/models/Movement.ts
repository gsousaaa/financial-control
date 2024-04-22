import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../instances/mysql';

export interface MovementInstance extends Model {
    id: number,
    movementType: string,
    value: number,
    dateCreated: string,
    user_id: number
}


export const Movement = sequelize.define<MovementInstance>('Movement', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },

    movementType: {
        allowNull: false,
        type: DataTypes.ENUM('revenue', 'expense')
    },

    value: {
        allowNull: false,
        type: DataTypes.FLOAT
    },
    dateCreated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'movements',
    timestamps: false
})

sequelize.sync()
    .then(() => {
    })
    .catch(error => {
        console.log(error)
    })
