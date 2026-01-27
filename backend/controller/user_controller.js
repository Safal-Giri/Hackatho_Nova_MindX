const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user_model')

exports.UserRegister = async (req, res) => {
console.log("hello")
  try {
    const { username, email, age, password, phoneNo } = req.body
    console.log(req.body)

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        status: "failed",
        message: "User already exists"
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      age,
      phoneNo
    })

    await user.save()

    res.status(201).json({
      message: "User registered successfully"
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }

}

exports.UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid credentials"
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({
        status: "failed",
        message: 'Invalid username or password'
      })
    }
    // create token
    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    )
    res.json({
      message: 'Login successful',
      token,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "failed",
      message: "Server error",
      error: error.message
    })
  }
}