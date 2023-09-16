const { secretKey } = require("./config");
const jwt = require("jsonwebtoken");
if (!token) {
    res.status(401).json({
       msg:"no token"
   })
}
try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded
    next()
} catch (error) {
    res.status(500).json({
        msg:"error token"
    })
}