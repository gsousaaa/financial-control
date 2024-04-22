import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { User } from '../models/User';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { isEmail } from 'validator';

dotenv.config()

interface bodyLogin {
    email: string,
    password: string
}

interface bodyRegister extends bodyLogin {
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
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: '2h' }
    )

    return res.status(201).json({ id: newUser.id, email: newUser.email, saldo: newUser.saldo, token })
}

export const login = async (req: Request, res: Response) => {
    let { email, password }: bodyLogin = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'Preencha os campos!' })
    }

    if (!isEmail(email)) {
        return res.status(400).json({ message: 'E-mail inválido' })
    }

    let user = await User.findOne({
        where: {
            email
        }
    })

    if (!user) {
        return res.status(400).json({ message: 'E-mail e/ou senha inválidos' })
    }

    let passwordMatch = bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
        return res.status(400).json({ message: 'E-mail e/ou senha inválidos' })
    }

    let token = JWT.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: '2h' }
    )
    
    return res.status(200).json({ message: 'Login efetuado com sucesso!', token })

}
