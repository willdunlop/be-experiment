const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();

const auth = require('../auth');

const Users = mongoose.model('Users');

/**
 * Registration route
 * @type: POST
 */
router.post('/', auth.optional, (req, res, next) => {
    const { user } = req.body;

    if (!user.email) return res.status(422).json({ errors: { message: 'Email is required' } });
    if (!user.password) return res.status(422).json({ errors: { message: 'Password is required' } });

    const newUser = new Users(user);
    newUser.setPassword(user.password);

    return newUser.save()
        .then(() => res.json(newUser.toAuthJSON()))
        .catch(err => console.log('error', err))
});

/**
 * Login route
 * @type: POST
 * expects user.email and user.password
 */
router.post('/login', auth.optional, (req, res, next) => {
    const { user } = req.body;

    if (!user.email) return res.status(422).json({ errors: { message: 'Email is required' } });
    if (!user.password) return res.status(422).json({ errors: { message: 'Password is required' } });

    const authenticate = passport.authenticate('local', { session: false }, (err, passportUser, info) => {
        if (err) return next(err);

        if(passportUser) {
            const user = passportUser;
            user.token = passportUser.generateJWT();

            return res.json(user.toAuthJSON());
        }

        return status(400).info;
    })
    
    return authenticate(req, res, next);
});

/**
 * Current route
 * @type: GET
 */
router.get('/current', auth.required, (req, res, next) => {
    const { id } = req.payload;

    return Users.findById(id)
        .then(user => {
            if(!user) return res.sendStatus(400);
            return res.json(user.toAuthJSON());
        });
});


module.exports = router;