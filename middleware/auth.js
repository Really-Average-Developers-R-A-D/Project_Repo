const requireAuth = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    next();
  };
  
  const checkRole = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.session.user.role)) {
        return res.status(403).render('error', { message: 'Access denied' });
      }
      next();
    };
  };
  
  module.exports = { requireAuth, checkRole };