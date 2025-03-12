const express = require("express");
const { isLogedIn } = require("./middlewares/auth.js");
const { User } = require("./models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const { jwt_secret } = require("./config/index.js");
const cors = require("cors");
const morgan = require("morgan");

const app = express();


// THIS IS A MIDDLEWARE

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send("Your highly welcome on my backed project");
})
// this is not needed in mongodb was just for postman
// const users =[
//     {
//         email:"mwesigyesam@gmail.com",
//         password: "123",
//         username:"mwesigye",
//     },
//     {
//         email:"confyeagle@gmail.com",
//         password: "456",
//         username:"con",
//     },
//     {
//         email:"mugabo@gmail.com",
//         password: "456",
//         username:"mugabo",
//     },
//     {
//         email:"ndahiro@gmail.com",
//         password: "456",
//         username:"ndahiro",
//     },
// ];

// app.post("/login",(req,res)=>{
//     const email = req.body.email;
//     const password = req.body.password;


//     const user = users.find((usr)=>usr.email === email);
//     if (!user) {
//         return res.status(404).json({message:"invilid credentials"})

//     }
//     const isPasswordCorrect = user.password === password;
//     if (!isPasswordCorrect) {
//        return res.status(400).json({message:"You are not allowed to login"})
//     }
//     return res.status(200).json(user);
// })
// // this code help u to get all users
// app.get("/users",(req,res)=>{
//     res.status(200).json(users);
// })

// // app.post("/users/register", async(req,res)=>{
// //     const{email,password,username} = req.body;

// //     if(!email || email === "" || !password || password === "" || !username || username === ""){
// //         return res.status(400).json({
// //             message: "Please provide all information"
// //         });
// //     }

//     // this was used in postman so now we are going to used mongodb
//     // const existEmail = users.find(user => user.email === email);
//     const existEmail = await User.find({
//         email,
//     })
//     if (existEmail) {
//         return res.status(200).json({message:"please take another email"})
//     }
//     // const existPassword = users.find(user => user.password === password);
//     // if (existEmail) {
//     //     return res.status(200).json({message:"please take another password"})
//     // }

//     const existUsername = users.find(user => user.username === username);
//     if (existUsername) {
//         return res.status(200).json({message:"please take another username"})
//     }

//     const newUser={
//         email,
//         password,
//         username
// };
//     users.push(newUser);

//     return res.status(200).json(newUser)

// })

// app.all("*",(req,res)=>{
//     return res.status(404).json({message:"Endpoint not found"});
// })

app.post("/users/register", async (req, res) => {
    try {
        const { email, username, password } = req.body; //this line will verify the recorded data if it matches with that one entered
        const checkExitEmail = await User.findOne({
            email,
        });
        console.log(checkExitEmail);

        if (checkExitEmail) {
            return res.status(409).json({ message: "email exisit" })
        }
        // for username

        const checkExitUsername = await User.findOne({
            username,

        });
        if (checkExitUsername) {
            return res.status(409).json({ message: "username taken so use another one" })
        }
        // if everything is ok register a user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            username,
            password: hashedPassword
        });
        // to save in database

        const saveUser = await user.save();
        return res.status(201).json({
            message: "the user saved successfully",
            user: saveUser,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "sever error" })
    }
})

// to get all users
app.get("/users", isLogedIn, async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ message: "Operation successfull", users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "sever error" })
    }
})

// to update a user

app.put("/users/:id", async (req, res) => {
    const id = req.params.id;
    const { first_name, last_name } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate({ _id: id }, {
            $set: {
                first_name,
                last_name,
            }
        }, { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: "user not found" });
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// update usingpatch http method
app.patch("/users/:id/update-username", async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.body;
        const exisit = await User.findOne({ username });
        if (exisit) {
            return res.status(409).json({ message: "the username was already taken" })
        }
        updatedUser = await User.findByIdAndUpdate(id, { $set: { username } }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "user is not updated" });
        }
        return res.status(200).json({ message: "user updated successfully" });

    } catch (error) {
        console.log(error);

        res.status(400).json({ message: "try again please" });
    }
})
// to delete a user
app.delete("/users/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const deleteUser = await User.findByIdAndDelete( id );
        return res.status(204).json({message:"user deleted successfully"});
    } catch (error) {
        console.log(error);
        
        res.status(400).json({ message:"user not deleted" });
    }
})
app.post("/login",async(req,res)=>{
    try {
     const {email,password} =req.body;
     const user = await User.findOne({email});
     if (!user) {
        return res.status(404).json({message:"invalid credations"});
     }
       // comparisson of password
       const isPasswordCorrect = await bcrypt.compare(password,user.password);
       if (!isPasswordCorrect) {
        return res.status(400).json({message:"you go far we can not give u an access"});
       }
// if everything is okay
       const token = jwt.sign({id:user._id},jwt_secret,{expiresIn:"1d"});
       return res.status(200).json({message:"token successfully",token, user});
    } catch (error) {
        console.log(error);
        
        res.status(400).json({ message:"your are not allowed to login" });
    }
})
mongoose.connect("mongodb://localhost:27017/apaer")
    .then(() => {
        console.log("Database connected");

        app.listen(5000, () => console.log("My app is running at port of 5000"));
    })
    .catch(err => console.log("error"));



