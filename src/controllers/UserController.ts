import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv'
import { Movement } from '../models/Movement';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
dotenv.config()

interface bodyMovement {
    movementType: string,
    value: string
}

interface updateBodyMovement extends bodyMovement {
    id: number
}

export const createMovement = async (req: AuthRequest, res: Response) => {
    let { movementType, value }: bodyMovement = req.body
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
    let { id, movementType, value }: updateBodyMovement = req.body

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

            await user.update({balance})

            return res.status(200).json({message: 'Movimento editado com sucesso', newMovement, actual_balance: user.balance})

        } else if (movementType !== undefined && movementType !== movement.movementType) {
           let newMovement =  await movement.update({ movementType })
           return res.status(200).json({message: 'Movimento editado com sucesso', newMovement, actual_balance: user.balance})

        }

    } catch (err) {
        res.status(400).json(err)
    }




}
