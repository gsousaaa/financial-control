import { Router} from "express";
import * as UserController from '../controllers/UserController'
import  { Auth }  from "../middlewares/auth";

const router = Router()

router.post('/movement',  Auth.private, UserController.createMovement)
router.put('/movement', Auth.private, UserController.updateMovement)
router.delete('/movement', Auth.private, UserController.deleteMovement)



export default router;

