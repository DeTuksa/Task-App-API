const errorMiddleware = (req, res, next) => {
    throw new Error('Middleware error')
}

module.exports = errorMiddleware