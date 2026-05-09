"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const likeController_1 = require("../controllers/likeController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/:productId', auth_1.protect, likeController_1.toggleLike);
router.get('/user', auth_1.protect, likeController_1.getUserLikes);
exports.default = router;
