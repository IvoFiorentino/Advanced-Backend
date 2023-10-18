export function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ error: 'You do not have the permissions to perform this operation' });
    }
}

export function isUser(req, res, next) {
    if (req.session.user && req.session.user.role === 'user') {
        next();
    } else {
        res.status(403).json({ error: 'You do not have the permissions to perform this operation' });
    }
}