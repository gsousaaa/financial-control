import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { User } from '../models/User';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { isEmail } from 'validator';

interface body { 
    email: string,
    password: string
}

interface bodyRegister extends body {
    name: string
}

export const register = async (req: Request, res: Response) => {
    let { name, email, password }: bodyRegister = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Preencha os campos obrigatórios' })
    }

    if (!isEmail(email)) {
        return res.status(400).json({ message: 'E-mail inválido' })
    }

    let hasUser = await User.findOne({ where: { email } })
    if (hasUser) {
        return res.status(400).json({ message: 'E-mail já cadastrado' })
    }

    let passwordHash = await bcrypt.hash(password, 10)

    let newUserObj = {
        name,
        email,
        passwordHash
    }

    let newUser = await User.create(newUserObj)
    let token = JWT.sign(
        {id: newUser.id, email: newUser.email}, 
        process.env.JWT_SECRET_KEY as string,
        {expiresIn: '2h'}
    )

    return res.status(201).json({ id: newUser.id, email: newUser.email, saldo: newUser.saldo, token })
}

