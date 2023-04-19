const JWT = require('jsonwebtoken')

module.exports = async (request, response, next) => {
    try {
        const token = request.headers['authorization'].split(" ")[1]
        JWT.verify(token, process.env.JWT_SECRET, (error, decode) => {
            if (error) {
                return response.status(200).send({
                    message: 'Auth failed',
                    success: false
                })
            } else {
                request.body.userId = decode.id
                next()
            }
        })
    } catch (error) {
        console.log(error)
        response.status(401).send({
            message: 'Auth failed',
            success: false
        })
    }
}