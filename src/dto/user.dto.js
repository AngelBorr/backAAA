export default class UserDTO {
    constructor(user) {
        this._id = user._id
        this.first_name = user.firstName;
        this.last_name = user.lastName;
        this.email = user.email;
        this.birth_date = user.birth_date;
        this.role = user.role;
        this.cart = user.cart;
        this.last_connection = user.last_connection
    }
}