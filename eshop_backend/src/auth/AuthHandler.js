class AuthHandler {
    constructor(userService) {
        this.userService = userService;
    }
    async login(credentials) {
        throw new Error("login() must be implemented.");
    }
}

module.exports = AuthHandler;
