const AuthHandler = require("./AuthHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class PhonePasswordAuth extends AuthHandler{
    constructor(userService) {
        super(userService);
    }

    async login({ phone, password }) {
        if (!phone) throw new Error("Telefon necesar");

        const user = await this.userService.findByPhone(phone);
        if (!user) throw new Error("Telefon incorect");

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) throw new Error("Parolă incorectă");

        return {
            id: user.id,
            role: user.role
        };
    }
}

module.exports = PhonePasswordAuth;
