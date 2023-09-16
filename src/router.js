const mongoose = require("mongoose");
const express = require("express");
const { user } = require("../src/model/model");
const { secretKey } = require("../config");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { authenticate } = require("./authmiddleware");

function generateRefralCode() {
    const min = 1000000000;
    const max = 99999999999;
    const random4DigitOTP = Math.floor(Math.random() * (max - min + 1)) + min;
    return random4DigitOTP;
}
const random4DigitOTP = generateRefralCode();
router.post("/register", async (req, res) => {
    myRefferalCode = random4DigitOTP
    if (!req.body.refralCode) {
        const data = {
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.password,
            myRefferalCode: myRefferalCode
        };
        console.log("data---------------", data)
        const existingUser = await user.findOne({ email: data.email });
        console.log("existingUser---------------", existingUser)
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }
        const saltrounds = 5;
        const hashedpassword = await bcrypt.hash(req.body.password, saltrounds);
        data.password = hashedpassword;
        const userData = new user(data);
        let data1 = await userData.save();
        return res.status(200).json({
            msg: "Successfully registered",
            result: data1
        });
    } else {
        const data = {
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.password,
            refralCode: req.body.refralCode,
            myRefferalCode: myRefferalCode
        };
        // console.log("data----------", data)
        let referralBonus = 0;
        // console.log("referralBonus-----------",referralBonus)
        const currentDate = new Date()
        const dayOfWeek = currentDate.getDay()
        console.log("dayOfWeek=============>",dayOfWeek)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            // Weekdays (Monday to Friday)
            referralBonus = 50;
        } else if (dayOfWeek === 6) {
            // Saturday (Weekend)
            referralBonus = 100;
        } else {
            // Sunday (Weekend) and National Holiday
            referralBonus = 200;
        }
        const existingUser = await user.findOne({ email: data.email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }
        const saltrounds = 5;
        const hashedpassword = await bcrypt.hash(req.body.password, saltrounds);
        data.password = hashedpassword;
        const userData = new user(data);
        let parent = await user.findOne({ myRefferalCode: req.body.refralCode })
        console.log("parent-------------->>>>>", parent)
        if (!parent) throw "parent not exits"
        if (parent) {
            if (!parent.refferalBonus) {
                parent.refferalBonus = referralBonus
                console.log("parent.refferalBonus-------------", parent.refferalBonus)

            }
            await parent.save()
            console.log("parent----------", parent)
            let updateParent = await user.findOneAndUpdate(
                { myRefferalCode: req.body.refralCode },
                { $push: { childrenUser: userData._id } },
                { new: true }
            )
            if (parent.childrenUser.length === 0) {
                // parent.childrenUser.push(userData._id)
                parent.refferalBonus = referralBonus
            } else if (parent.childrenUser.length === 1) {
                // parent.childrenUser.push(userData._id)
                parent.refferalBonus += referralBonus * 0.5
                console.log("parent.refferalBonus============", parent.refferalBonus)
            }
            else {
                const bonusIncrease = referralBonus * 0.1;
                console.log("bonusIncrease---------->", bonusIncrease)
                parent.refferalBonus += bonusIncrease;
                console.log("parent===========>>>>", parent)
                console.log("parent.refferalBonus---------->>>>>>>>>>>>>>>>>>>>", parent.refferalBonus)
            }
            await parent.save();

            let data1 = await userData.save();
            return res.status(200).json({
                msg: "Successfully registered",
                result: data1

            });
        }
        else throw "parent user not found"
    }
});


router.get("/getdata", async (req, res) => {
    try {
        const response = await user.find();
        console.log("response=============================", response);
        if (!response) {
            throw "invalited data find"
        }
        return res.status(200).json({
            msg: "succssfully getting",
            count: response.length,
            result: response
        });
    } catch (error) {
        console.log("error====================================", error);
        res.status(500).json({
            msg: "error data find",
            error: error.message
        });
    }
});
router.get("/getById/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await user.findById(id).populate("childrenUser");
        console.log("result==============================", result)
        if (!result) {
            throw "invalited data find"
        }
        return res.status(200).json({
            msg: "data success",
            result: result
        });
    } catch (error) {
        console.log("error=============================", error);
        res.status(500).json({
            msg: "error find data",
            error: error.message
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await user.findOne({ email });
        console.log("existingUser=========", existingUser)
        if (!existingUser) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ id: existingUser._id.toString() }, secretKey);
        res.status(200).json({
            message: "Login successful",
            user: existingUser,
            token
        });
    } catch (error) {
        console.log("Error during login:", error.message);
        res.status(500).json({
            message: "Error occurred during login",
            error: error.message
        });
    }
});

router.put("/updateData/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const newdata = {
            userName: req.body.userName,
        };
        console.log("newdata=============================", newdata);
        const updatedata = await user.findByIdAndUpdate(id, newdata, { new: true });
        console.log("updatedata====================", updatedata);
        if (!updatedata) {
            res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "updatedata successfully",
            result: updatedata
        });
    } catch (error) {
        console.log("error=================================", error);
        res.status(500).json({
            msg: "error data find",
            error: "error message"
        });
    }
});

router.put("/updatedataByUserToken", authenticate, async (req, res) => {
    try {
        const userId = req.user.id; 
        console.log("userId--------------",userId)
        let obj = {
            userName: req.body.userName,
}
        const userData = await user.findByIdAndUpdate(userId, { $set: obj }, { new: true });
        if (!userData) {
            return res.status(404).json({ message: "User data not found" });
        }
        res.status(200).json({
            message: "User data found successfully...",
            user: userData,
        });
    } catch (error) {
        console.log("Error while getting data:", error.message);
        res.status(500).json({
            message: "Error occurred while getting data",
            error: error.message,
        });
    }
});

router.delete("/deleteData/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const deletedata = await user.findByIdAndDelete(id);
        if (!deletedata) {
            res.status(401).json({
                msg: "invalited data find"
            });
        }
        return res.status(200).json({
            msg: "deletedata seccuessfully",
            result: deletedata
        });
    } catch (error) {
        console.log("error==============================", error);
        res.status(500).json({
            msg: "error data find",
            error: error.message
        });
    }
});

router.delete("/deletedataByUserToken", authenticate, async (req, res) => {
    try {
        const userId = req.user.id; 
        console.log("userId--------------",userId)
        const userData = await user.findByIdAndDelete(userId);
        if (!userData) {
            return res.status(404).json({ message: "User data not found" });
        }
        res.status(200).json({
            message: "User data found successfully...",
            user: userData,
        });
    } catch (error) {
        console.log("Error while getting data:", error.message);
        res.status(500).json({
            message: "Error occurred while getting data",
            error: error.message,
        });
    }
});
module.exports = router