const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const openRoutes = ['/api/users/login', '/api/users/signup'];
    if (openRoutes.includes(req.path)) {
        return next();
    }
    const token = req.headers['authorization'] ? req.headers['authorization'] : null;

    if (!token) {
        return res.status(403).send({ message: 'Un token est requis pour l\'authentification' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (err) {
        console.error(err);
        return res.status(401).send({ message: 'Token invalide' });
    }

    next();
};

module.exports = authMiddleware;
