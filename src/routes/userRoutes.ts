import { Router} from "express";
import * as UserController from '../controllers/UserController'
import  { Auth }  from "../middlewares/auth";

const router = Router()

router.post('/movement',  Auth.private, UserController.createMovement)
router.put('/movement', Auth.private, UserController.updateMovement)
router.delete('/movement/:id', Auth.private, UserController.deleteMovement)
router.get('/movements', Auth.private, UserController.getMovements)
router.get('/balance', Auth.private, UserController.getBalance)



export default router;

