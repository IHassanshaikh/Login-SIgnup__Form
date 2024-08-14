require("dotenv").config();
const express = require("express");
const cookieparser = require("cookie-parser");
const connection = require("./db/connect");
const path = require("path");
const hbs = require("hbs");
const Registeration = require("./model/signup");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth =  require("./middleware/auth")

const port = process.env.PORT || 3000;
const app = express();

const staticpath = path.join(__dirname, "/src/public");
const viewspath = path.join(__dirname, "/templates/views");
const partialpath = path.join(__dirname, "/templates/partials");

hbs.registerPartials(partialpath);
app.set("view engine", "hbs");
app.set("views", viewspath);
app.use(express.static(viewspath));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());

app.get("/" ,(req, res) => {
    res.render("login");
});
app.get("/signup", (req, res) => {
    res.render("signup");
});
app.get("/index", auth, (req, res) => {
    res.render("index", { user: req.user });
});
app.get("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((tokenObj) => {
            return tokenObj.token !== req.token;
        });

        await req.user.save();
        res.clearCookie("jwt");
        console.log("logout successfully");
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
});


app.post("/signup", async (req, res) => {
    const password = req.body.password;
    const confirmpassword = req.body.confirmPassword;

    if (password !== confirmpassword) {
        return res.send("Password is not matching");
    }

    try {
        const registerations = new Registeration({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            age: req.body.age,
            password: password,
            confirmpassword: confirmpassword
        });

        const token = await registerations.generateauthtoken();

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 70000),
            httpOnly: true
        });

        const registered = await registerations.save();
        res.status(201).render("login");

    } catch (error) {
        res.status(500).send("Error during signup");
    }
});

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await Registeration.findOne({ email: email });
        if (!user) {
            return res.status(400).send("Invalid login details");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Invalid login details");
        }

        const token = await user.generateauthtoken();
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(201).render("index", { user });

    } catch (error) {
        res.status(400).send("Invalid login details");
    }
});


app.listen(port, () => {
    console.log(`server is running at ${port}`);
})