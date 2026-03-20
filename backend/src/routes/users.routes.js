const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const c = require("../controllers/users.controller");

router.get("/me", auth, c.getMe);
router.get("/", auth, role("ADMIN", "SUPER_ADMIN"), c.listUsers);
router.post("/", auth, role("ADMIN", "SUPER_ADMIN"), c.createUser);
router.patch("/:id/role", auth, role("SUPER_ADMIN"), c.changeRole);
router.delete("/:id", auth, role("ADMIN", "SUPER_ADMIN"), c.deleteUser);

module.exports = router;