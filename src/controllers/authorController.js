
const authorModel = require('../models/authorModel');
const validator = require('validator')
const jwt = require("jsonwebtoken");

const isValid = function (val) {
    if (typeof val === "undefined" || val === null) return false
    if (typeof val === "string" && val.trim().length === 0) return false
    return true;
}

const regexValidator = function(val){
    let regx = /^[a-zA-z]+([\s][a-zA-Z]+)*$/;
    return regx.test(val);
}
// const regexForPassword = function(pass){
//     let regx = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&-+=()])(?=\\S+$).{8, 20}$/;
//     return regx.test(pass);
// }

const bodyValidator = function (data) {
    return Object.keys(data).length > 0
}
const createAuthor = async function (req, res) {
    try {
        let data = req.body
        let titleValues = ["Mr","Mrs", "Miss"];
        if (!bodyValidator(data)) return res.status(400).send({ status: false, msg: "please enter body" })
        if (!isValid(data.fname) || !regexValidator(data.fname)) return res.status(400).send({ status: false, msg: "please enter first name correctly" })
        if (!isValid(data.lname) || !regexValidator(data.lname)) return res.status(400).send({ status: false, msg: "please enter last name correctly" })
        if (!isValid(data.title) || !titleValues.includes(data.title)) return res.status(400).send({ status: false, msg: "please enter title correctly" })
        if (!isValid(data.email)) return res.status(400).send({ status: false, msg: "please enter email" })
        if (!isValid(data.password)) return res.status(400).send({ status: false, msg: "please enter password" })

        if (!(validator.isEmail(data.email))) return res.status(400).send({ status: false, msg: "please enter a valid email" })

        let usedEmail = await authorModel.findOne({ email: data.email })
        if (usedEmail) return res.status(400).send({ status: false, msg: `${data.email} already registered` })

        let author = await authorModel.create(data)

      return  res.status(201).send({ status: true, msg: " author created successfully", data: author })

    }
    catch (err) {
      return  res.status(500).send({ errror: err.message })
    }
}

const loginAuthor = async function (req, res) {
    try {
        let data = req.body
    if (!bodyValidator(data)) return res.status(400).send({ status: false, msg: "please enter body" })
        let userName = req.body.email;
    if(!isValid(userName)){return res.status(400).send({ status: false, msg: "please enter email" })}
    if (!(validator.isEmail(data.email))) return res.status(400).send({ status: false, msg: "please enter a valid email" })
        let password = req.body.password;
    if(!isValid(data.password)){return res.status(400).send({ status: false, msg: "please enter password" })}

        let author = await authorModel.findOne({ email: userName, password: password });
        if (!author)
            return res.status(400).send({
                status: false,
                msg: "username or the password is not correct",
            });

        let token = jwt.sign(
            {
                authorId: author._id.toString(),
                batch: "radon",
                organisation: "FunctionUp",
            },
            "ourFirstProject"
        );
        res.status(201).setHeader("x-api-key", token);
        res.status(201).send({ status: true, token: token });
    } catch (error) {
       return res.status(500).send({ msg: "Error", error: error.message })
    }
};

module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor