import express from 'express' 
import {registerUser, registerUsingPhone} from '../controller/registerUser.js' 
import checkEmail from '../controller/checkEmail.js' 
import {login, loginUsingPhone} from '../controller/login.js' 
import {userDetails, getUserDetailsFromId} from '../controller/userDetails.js' 
import logout from '../controller/logout.js' 
import updateUserDetails from '../controller/updateUserDetails.js' 
import searchUser from '../controller/searchUser.js' 
import {uploadImage, uploadVideo, uploadPDF } from '../controller/Upload.js'
import {upload} from "../helpers/multer.js"
import createGroup from '../controller/createGroup.js'

const router = express.Router()

router.route('/register').post(upload.single("profile_pic"), registerUser)
router.post('/registerUsingPhone', registerUsingPhone)
router.post('/email', checkEmail)
router.post('/login', login)
router.post('/loginUsingPhone', loginUsingPhone)
router.get('/user-details',userDetails)
router.get('/logout',logout)
router.route('/update-user').post(upload.single("profile_pic"), updateUserDetails)
router.post("/search-user",searchUser)
router.route('/uploadImage').post(upload.single('image'), uploadImage)
router.route('/uploadVideo').post(upload.single('video'), uploadVideo)
router.route('/uploadPDF').post(upload.single('pdf'), uploadPDF)
router.route('/create-group').post(upload.single('profile_pic'), createGroup)
router.route('/getUserDetailsFromId').post(getUserDetailsFromId)

export default router