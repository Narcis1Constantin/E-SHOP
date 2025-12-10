const pool = require("../db/pool");
const bcrypt = require("bcrypt");

class UserService {
    async findByEmail(email) {
        const { rows } = await pool.query(
            "SELECT id, role, password_hash, email FROM users WHERE email = $1",
            [email]
        );
        return rows[0];
    }

    async findByPhone(phone) {
        const { rows } = await pool.query(
            "SELECT id, role, password_hash, phone FROM users WHERE phone = $1",
            [phone]
        );
        return rows[0];
    }

    async validateEmailUser(email, password) {
        const user = await this.findByEmail(email);
        if (!user) throw new Error("Email incorect");

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) throw new Error("Parolă incorectă");

        return user;
    }

    async validatePhoneUser(phone, password) {
        const user = await this.findByPhone(phone);
        if (!user) throw new Error("Telefon incorect");

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) throw new Error("Parolă incorectă");

        return user;
    }
}

module.exports = new UserService();
