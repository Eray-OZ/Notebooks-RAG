

const errorHandler = (err, req, res, next) => {

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode

    let message = err.message


    if (err.name === 'ValidationError') {
        message = Object.values(err, errors).map(val => val.message).join(', ')
        statusCode = 400
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    })
}

export default errorHandler