import { Request, Response, NextFunction } from 'express'
import JWT from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export interface AuthRequest extends Request {
        id?: number;
        email?: string;
}

export const Auth = {
    private: async (req: AuthRequest, res: Response, next: NextFunction) => {
        let sucess = false

        if (req.headers.authorization) {
            let [authType, token] = req.headers.authorization.split(' ')
            if (authType === 'Bearer') {
                try {
                    const decoded: any = JWT.verify(token, process.env.JWT_SECRET_KEY as string)
                    if (decoded) {
                        req.id = decoded.id
                        req.email = decoded.email
                        sucess = true
                    }
                } catch (err) {
                    console.log(err)
                }
            }

            if (sucess) {
                next()
            } else {
                res.status(403).json({ error: 'Não autorizado' })
            }
        }
    }

}
