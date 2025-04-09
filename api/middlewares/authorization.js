const { StatusCodes } = require('http-status-codes')

exports.authorization = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization')
    console.log('Auth header :', authHeader)
    if (!authHeader)
      res.status(401).json({ message: 'Patient not authenticated.' })

    const token = authHeader.split(' ')[1]
    res.status(StatusCodes.OK).json({
      message: 'user Authorized',
      token
    })
  } catch (error) {
    console.log('Authorization error: ', error.message)
    res.status(StatusCodes).json({
      message: 'User not authorized'
    })
  }
}
