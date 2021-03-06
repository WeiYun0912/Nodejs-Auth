if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const passport = require("passport");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("./passport-config");

initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);
const users = [];

app.set("view-engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", checkAuth, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

app.get("/login", checkNotAuth, (req, res) => {
  res.render("login.ejs");
});
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post(
  "/login",
  checkNotAuth,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
app.post("/register", checkNotAuth, async (req, res) => {
  // const {} = req.body;
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
    });

    res.redirect("/login");
  } catch (error) {
    res.redirect("/register");
  }
  console.log(users);
});

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

function checkNotAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  next();
}

app.listen(3001, () => {
  console.log("server on port 3001~");
});
