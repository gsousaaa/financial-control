import { Request, Response } from 'express';
import dotenv from 'dotenv'
import { Movement } from '../models/Movement';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { Op, where } from 'sequelize';

dotenv.config()

interface createMovementBody {
    movementType: string,
    value: string,
    description: string
}

interface updateBody extends createMovementBody {
    id: number
}

interface filterDate {
    startDate: string,
    endDate: string
}


export const createMovement = async (req: AuthRequest, res: Response) => {
    let { movementType, value, description }: createMovementBody = req.body
    let user_id = req.id

    if (!movementType || !value || !description) {
        return res.status(400).json({ message: "Preencha os  campos obrigatórios" })
    }

    try {
        let user = await User.findByPk(user_id)

        if (!user) {
            return res.status(400).json({ message: "Usuário não encontrado" })
        }

        let balance = user.balance
        let valueFloat = parseFloat(value)

        if (movementType === 'revenue') {
            balance += valueFloat
        }

        if (movementType === 'expense') {
            balance -= valueFloat
        }

        await user.update({ balance })

        let newMovement = await Movement.create({ movementType, value, description, user_id })

        res.status(201).json({ newMovement, actual_balance: user.balance })
    } catch (err) {
        res.status(404).json({ err })
    }

}

export const updateMovement = async (req: AuthRequest, res: Response) => {
    let { movementType, value, description }: updateBody = req.body
    let { id } = req.params

    try {
        let movement = await Movement.findOne({ where: { id, user_id: req.id } })
        let user_id = req.id
        let user = await User.findByPk(user_id)

        if (!movement) {
            return res.status(400).json({ message: 'Movimentação não encontrada' })
        }

        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado' })
        }

        // Calcula a diferença entre o valor antigo e o novo valor
        let oldValue = parseFloat(movement.value)
        let newValue = parseFloat(value)
        let balance = user.balance
        let difference = newValue - oldValue
        let oldMovementType = movement.movementType


        if (movementType && movementType !== oldMovementType) {
            // Se houve mudança, ajusta o saldo de acordo com os tipos de movimento
            if (oldMovementType === 'revenue') {
                balance -= oldValue // Subtrai o valor antigo do saldo
            } else if (oldMovementType === 'expense') {
                balance += oldValue // Adiciona o valor antigo ao saldo
            }
        }


        // Atualiza a movimentação com os campos fornecidos
        if (movementType) {
            movement.movementType = movementType
        } else {
            movement.movementType = oldMovementType
            movementType = oldMovementType
        }
        
        if (value) {
            movement.value = value
        }

        if (description) {
            movement.description = description
        }

        if (movementType === 'revenue') {
            balance += difference
        } else if (movementType === 'expense') {
            balance -= difference
        }

        await movement.save()
        await user.update({balance})

        return res.status(200).json({ message: 'Movimentação atualizada com sucesso!', updatedMovement: movement, updatedBalance: user.balance })

       
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

        let movement = await Movement.findOne({ where: { id, user_id: req.id } })

        if (!movement) {
            return res.status(400).json({ message: 'Não foi possível deletar a movimentação!' })
        }

        await Movement.destroy({ where: { id, user_id: req.id } })

        return res.status(200).json({ message: 'Movimentação deletada com sucesso!' })

    } catch (err) {
        console.log(err)
        return res.status(404).json({ err })
    }
}

export const getMovements = async (req: AuthRequest, res: Response) => {

    const isValidDate = (dateString: string): boolean => {
        const regex = /^(?:19|20)\d\d-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/;
        return regex.test(dateString);
    }

    try {
        let { startDate, endDate }: filterDate = req.body
        let { page, pageSize }: any = req.query
        pageSize = pageSize ? parseInt(pageSize) : 5
        page = page ? parseInt(page) : 1

        if (startDate || endDate) {
            if (startDate && !isValidDate(startDate) || endDate && !isValidDate(endDate)) {
                return res.status(400).json({ message: "Formato de data inválida" })
            }
            let whereClause: any = { user_id: req.id, dateCreated: null }

            if (startDate && endDate) {
                whereClause.dateCreated = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            } else if (startDate) {
                whereClause.dateCreated = {
                    [Op.gte]: new Date(startDate)
                }
            } else if (endDate) {
                whereClause.dateCreated = {
                    [Op.lte]: new Date(endDate)
                }
            }

            let movements = await Movement.findAll({ where: whereClause, limit: pageSize, offset: (page - 1) * pageSize })
            if (!movements) {
                return res.status(400).json({ message: 'Não foram encontradas movimentações relacionadas a esse usuário!' })
            }

            return res.status(200).json({ movements, username: req.username })
        } else {
            let movements = await Movement.findAll({ where: { user_id: req.id }, limit: pageSize, offset: (page - 1) * pageSize })
            if (!movements) {
                return res.status(400).json({ message: 'Não foram encontradas movimentações relacionadas a esse usuário!' })
            }

            return res.status(200).json({ movements, username: req.username })
        }
    } catch (err) {
        return res.status(400).json({ err })
    }
}

export const getBalance = async (req: AuthRequest, res: Response) => {
    try {
        let user = await User.findByPk(req.id)
        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado' })
        }

        return res.status(200).json({ id: req.id, username: req.username, balance: user.balance })

    } catch (err) {
        return res.status(400).json({ err })
    }
}

