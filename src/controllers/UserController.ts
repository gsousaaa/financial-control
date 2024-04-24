import { Request, Response } from 'express';
import dotenv from 'dotenv'
import { Movement } from '../models/Movement';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { Op } from 'sequelize';

dotenv.config()

interface createMovementBody {
    movementType: string,
    value: string
}

interface updateBody extends createMovementBody {
    id: number
}

interface filterDate {
    startDate: string, 
    endDate: string
}

export const createMovement = async (req: AuthRequest, res: Response) => {
    let { movementType, value }: createMovementBody = req.body
    let user_id = req.id

    if (!movementType || !value) {
        return res.status(400).json({ message: "Preencha os  campos obrigatórios" })
    }

    try {
        let user = await User.findByPk(user_id)

        if (!user) {
            return res.status(400).json({ message: "Usuário não encontrado" })
        }

        let balance = parseFloat(user.balance)
        let valueFloat = parseFloat(value)

        if (movementType === 'revenue') {
            balance += valueFloat
        }

        if (movementType === 'expense') {
            balance -= valueFloat
        }

        await user.update({ balance })

        let newMovement = await Movement.create({ movementType, value, user_id })

        res.status(201).json({ newMovement, actual_balance: user.balance })
    } catch (err) {
        res.status(404).json({ err })
    }

}

export const updateMovement = async (req: AuthRequest, res: Response) => {
    let { id, movementType, value }: updateBody = req.body

    if (!id && !movementType || !value) {
        return res.status(400).json({ message: 'Preencha o id e pelo menos 1 campo para editar!' })
    }

    try {
        let movement = await Movement.findByPk(id)
        let user_id = req.id
        let user = await User.findByPk(user_id)

        if (!movement) {
            return res.status(400).json({ message: 'Movimentação não encontrada' })
        }

        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado' })
        }

        if (value !== undefined && parseFloat(value) !== parseFloat(movement.value)) {
            let newMovement = await movement.update({ movementType, value })

            let newValue = parseFloat(value)
            let balance = parseFloat(user.balance)

            if (movementType === 'revenue') {
                balance += newValue
            } else if (movementType === 'expense') {
                balance -= newValue
            }

            await user.update({ balance })

            return res.status(200).json({ message: 'Movimento editado com sucesso', newMovement, actual_balance: user.balance })

        } else if (movementType !== undefined && movementType !== movement.movementType) {
            let newMovement = await movement.update({ movementType })
            return res.status(200).json({ message: 'Movimento editado com sucesso', newMovement, actual_balance: user.balance })
        }
    } catch (err) {
        res.status(400).json(err)
    }
}

export const deleteMovement = async (req: AuthRequest, res: Response) => {
    let { id } = req.params

    try {
        if (!id) {
            return res.status(400).json({ message: 'Preencha o campo de id para deletar uma movimentação!' })
        }

        await Movement.destroy({ where: { id, user_id: req.id } })
        return res.status(200).json({ message: 'Movimentação deletada com sucesso!' })

    } catch (err) {
        console.log(err)
        return res.status(404).json({ err })
    }
}

export const getMovements = async (req: AuthRequest, res: Response) => {
    
    const isValidDate = (dateString: string): boolean =>  {
        const regex = /^(?:19|20)\d\d-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/;
        return regex.test(dateString);
    }
    
    try {
        let { startDate, endDate }: filterDate = req.body
        
        if(startDate || endDate) {
            if(startDate && !isValidDate(startDate) || endDate && !isValidDate(endDate)) {
                return res.status(400).json({message: "Formato de data inválida"})
            }
            let whereClause: any = { user_id: req.id, dateCreated: null }

            if(startDate && endDate) {
                    whereClause.dateCreated = {
                        [Op.between]: [new Date(startDate), new Date(endDate)]
                    }
            } else if(startDate) {
                whereClause.dateCreated = {
                    [Op.gte]: new Date(startDate)
                }
            } else if(endDate) {
                whereClause.dateCreated = {
                    [Op.lte]: new Date(endDate)
                }
            }

            let movements = await Movement.findAll({where: whereClause})
            if(!movements) {
                return res.status(400).json({message: 'Não foram encontradas movimentações relacionadas a esse usuário!'})
            }
    
            return res.status(200).json({movements})
        } else {
            let movements = await Movement.findAll({where: {user_id: req.id}})
            if(!movements) {
                return res.status(400).json({message: 'Não foram encontradas movimentações relacionadas a esse usuário!'})
            }
    
            return res.status(200).json({movements})
        }
    } catch(err) {
        return res.status(400).json({ err })
    }
}

