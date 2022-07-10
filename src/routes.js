import express from 'express';
import { getUsers, Register, Login, Logout, addImages, updateImages } from './controllers/Users.js';
import { verifyToken } from './middleware/VerifyToken.js';
import { refreshToken } from './controllers/RefreshToken.js';
import { getPortofolios, getPortofolioById, savePortofolio, updatePortofolio, deletePortofolio } from './controllers/Portofolio.js';

const router = express.Router();

router.get('/users', getUsers);
router.post('/users', Register);
router.post('/login', Login);
router.post('/users/add-images/:id', addImages);
router.patch('/users/add-images/:id', updateImages);
router.get('/token', refreshToken);
router.delete('/logout', Logout);

// Route portofolio
router.get('/portofolio', getPortofolios);
router.get('/portofolio/:id', getPortofolioById);
router.post('/portofolio', savePortofolio);
router.patch('/portofolio/:id', updatePortofolio);
router.delete('/portofolio/:id', deletePortofolio);

export default router;
