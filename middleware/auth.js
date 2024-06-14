import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const auth = async (req, res, next) => {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).redirect('/auth')
  }
  try {
    const decoded = jwt.verify(token, global.__jwtKey)
    const user = await User.findById(decoded.id)
    if (!user) {
      throw new Error()
    }
    req.user = user
    next()
  } catch (err) {
    res.status(401).redirect('/auth')
  }
}

export default auth
