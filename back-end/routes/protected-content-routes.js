const express = require("express"); 
const passport = require("passport");

const protectedContentRoutes = () => {
  
  const router = express.Router();

  router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res, next) => {
      res.json({
        success: true,
        user: {
          id: req.user.id,
          username: req.user.username,
        },
        message:
          "Congratulations: you have accessed this route because you have a valid JWT token!",
      });
      next();
    }
  );

  return router;
};

module.exports = protectedContentRoutes;