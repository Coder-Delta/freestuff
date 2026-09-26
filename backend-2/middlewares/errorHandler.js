const errorHandler = (err, req, res, next) => {
    console.error('[error] ${err.stack || err.message}');



    //Mongoose validation error
    if (err.name === 'ValidationError') {
        const massages = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: massages,
        });
    }

    //Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            success: false,
            error: 'Duplicate Key Error',
            details: `Duplicate value for field: ${field}`,
        });
    }

    // Mongoose Cast Error
    if (err.name === 'CastError') {
        const field = err.path;

        return res.status(400).json({
            success: false,
            error: `Invalid value for field: ${field}`,
        });
    }

    // Generic server error
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error',
    });
};

module.exports = errorHandler;