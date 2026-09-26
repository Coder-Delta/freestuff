const validateRequest = (requiredFields) => {
    return (req, res, next) => {
        const missingField = requiredFields.filter(
            (field) => !req.body[field] || String(req.body[field]).trim() === ""
        );

        if (missingField.length > 0) {
            return res.status(400).json({
                sucess: false,
                error: "Missing required fields",
                missingField,
            });
        }
        if (requiredFields.includes('email') && req.body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(req.body.email)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid email format',
                });
            }
        }
        next();
    }
};

module.exports = validateRequest;