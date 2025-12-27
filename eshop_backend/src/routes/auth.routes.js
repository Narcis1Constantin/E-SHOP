const r = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');

// REGISTER
r.post(
    '/register',
    [
        body('name').trim().isLength({ min: 2 }).withMessage('Nume prea scurt'),
        body('email').isEmail().withMessage('Email invalid'),
        body('phone').matches(/^\+?\d{8,15}$/).withMessage('Telefon invalid'),
        body('address').trim().isLength({ min: 5 }).withMessage('Adresă prea scurtă'),
        body('password').isLength({ min: 6 }).withMessage('Parolă minim 6 caractere'),
    ],
    ctrl.register
);

// LOGIN (email+parolă sau phone+parolă)
r.post(
    '/login',
    [
        body('type')
            .exists().withMessage("Tip de autentificare necesar ('email' sau 'phone')")
            .isIn(['email', 'phone']).withMessage("Tip invalid. Folosește 'email' sau 'phone'."),

        body('password').exists().withMessage('Parola e necesară'),

        body().custom((value) => {
            if (value.type === "email" && (!value.email || value.email === "")) {
                throw new Error("Email necesar pentru autentificare cu email");
            }
            if (value.type === "phone" && (!value.phone || value.phone === "")) {
                throw new Error("Telefon necesar pentru autentificare cu telefon");
            }
            return true;
        }),
    ],
    ctrl.login
);

r.post('/reset-request', [
    body('email').isEmail().withMessage('Email invalid'),
], ctrl.resetRequest);

r.post('/verify-code', [
    body('email').isEmail().withMessage('Email invalid'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Cod invalid'),
], ctrl.verifyCode);

r.post('/reset-password', [
    body('email').isEmail().withMessage('Email invalid'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Cod invalid'),
    body('newPassword').isLength({ min: 6 }).withMessage('Parolă minim 6 caractere'),
], ctrl.resetPassword);


module.exports = r;
