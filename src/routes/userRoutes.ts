import { Router} from "express";
import * as UserController from '../controllers/UserController'
import  { Auth }  from "../middlewares/auth";

const router = Router()

router.post('/movement',  Auth.private, UserController.createMovement)



export default router;

