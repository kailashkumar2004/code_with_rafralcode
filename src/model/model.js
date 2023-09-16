const mongoose = require("mongoose");
const { secretKey } = require("../../config");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
    userName: {
        type: String
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String
    },
    refferalBonus: {
        type: Number
    },
    myRefferalCode: {
        type:String
    },
    refralCode:String,
    prentRefralcode: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    childrenUser: {
        type: [mongoose.Schema.Types.ObjectId],
        ref:"user",
    }
});
userSchema.static.findById = async function (token) {
    try {
        const decodedtoken = jwt.verify(token, secretKey);
        if (!decodedtoken) {
            throw "invalited token find"
        }
        const user = await this.findById(decodedtoken.id);
        if (!user) {
            throw "token not find"
        }
        return user
    } catch (error) {
        throw "error token find"
    }
}

userSchema.methods.comparepassword = async function (interedpassword) {
    return bcrypt.compare(interedpassword,this.password)
}
const user = mongoose.model("user", userSchema);
module.exports={user}