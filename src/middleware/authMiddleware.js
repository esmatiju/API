const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const openRoutes = ['/api/users/login', '/api/users/signup'];
    const isSwaggerRoute = req.path.startsWith('/api-docs');
    console.log(req.path);
    if (openRoutes.includes(req.path) || isSwaggerRoute) {
        return next();
    }

    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;

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
