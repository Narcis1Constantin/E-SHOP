const EmailPasswordAuth = require("./EmailPasswordAuth");
const PhonePasswordAuth = require("./PhonePasswordAuth");

class AuthFactory {
    static create(type, userService) {
        switch (type) {
            case "email":
                return new EmailPasswordAuth(userService);
            case "phone":
                return new PhonePasswordAuth(userService);
            default:
                throw new Error("Tip de autentificare invalid: " + type);
        }
    }
}

module.exports = AuthFactory;
