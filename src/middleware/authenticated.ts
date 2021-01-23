export default function (req, res, next) {
    if (req.session.user) {
        return next();
    }
    return res.status(401).send({message: 'Must be logged in to access this route.'})
}