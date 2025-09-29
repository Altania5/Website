const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me");
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    if (roles.includes(role)) return next();
    return res.status(403).json({ error: "Forbidden" });
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    const permissions = req.user?.permissions || [];
    if (permissions.includes(permission)) return next();
    return res.status(403).json({ error: "Forbidden" });
  };
}

module.exports = { requireAuth, requireRole, requirePermission };


