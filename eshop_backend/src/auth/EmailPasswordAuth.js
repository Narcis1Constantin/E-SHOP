const bcrypt = require("bcrypt");
const AuthHandler = require("./AuthHandler");
const jwt = require("jsonwebtoken");

class EmailPasswordAuth extends AuthHandler{
    constructor(userService) {
        super(userService);
    }

    async login({ email, password }) {
        if (!email) throw new Error("Email necesar");

        const user = await this.userService.findByEmail(email);
        if (!user) throw new Error("Email incorect");

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) throw new Error("Parolă incorectă");

        return {
            id: user.id,
            role: user.role
        };
    }
}

module.exports = EmailPasswordAuth;
