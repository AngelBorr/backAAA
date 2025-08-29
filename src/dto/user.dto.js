export default class UserDTO {
  constructor(user) {
    this._id = user._id
    this.first_name = user.firstName
    this.last_name = user.lastName
    this.email = user.email
    this.role = user.role
    //this.last_connection = user.last_connection
  }
}
