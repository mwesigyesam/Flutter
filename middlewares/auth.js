const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../config");


// these codes protect the user from getuser request
const isLogedIn = async(req,res,next)=>{
    try {
        const authorizationHeader = req.headers.authorization;
        console.log(authorizationHeader);
        
        if (!authorizationHeader) {
            return res.status(404).json({message:"Go far your not logged in"})
        }
      const token = req.headers.authorization.split("")[1];
      const payload = jwt.verify(token, jwt_secret);
      console.log(payload);
      const user = await user.findOne({_id:payload.id});
      if (!user) {
        return res.status(404).json({message:"sdghkj"});
      }

      req.user = user;
      next();
        
    } catch (error) {
      console.log(error);
      return res.status(500).json({message:"server error"});
        
    }
}
module.exports={isLogedIn};