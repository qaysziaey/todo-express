const { Router } = require("express");
const user = require("./users.route");

const router = Router();
router.use("/:user", user);

router.get("/", (req, res) => {
  return res.json({ message: "Welcome to your Todos API" });
});
module.exports = router;
