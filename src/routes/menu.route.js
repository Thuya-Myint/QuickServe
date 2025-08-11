// routes/menuRoutes.js
const express = require('express');
const menuRouter = express.Router();
const menuController = require('../controllers/menu.controller');

menuRouter.post('/', menuController.createMenuItem);
menuRouter.get('/', menuController.getMenuItems);
menuRouter.get('/:id', menuController.getMenuItem);
menuRouter.put('/:id', menuController.updateMenuItem);
menuRouter.delete('/:id', menuController.deleteMenuItem);

module.exports = menuRouter;
