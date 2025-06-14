function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ error: 'Unauthorized: Role not found' });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
}

module.exports = authorizeRoles;
