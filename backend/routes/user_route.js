const express=require('express')
const user_controller = require('../controller/user_controller')
const router=express.Router()

router.post('/register',user_controller.UserRegister)
router.post('/login',user_controller.UserLogin)

module.exports=router