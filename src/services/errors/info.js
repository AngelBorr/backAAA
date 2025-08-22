export const generateUserErrorInfo = ({firstName, lastName, email, age, password, birth_date, role}) => {
    return `One or more properties were incomplete or not valid.
    List of required properties:
    * first_name : needs to be a String, received: ${firstName}
    * last_name : needs to be a String, received: ${lastName}
    * email : needs to be a String, received: ${email}
    * age : needs to be a String, received: ${age}
    * password : needs to be a String, received: ${password}
    * birth_date : needs to be a String, received: ${birth_date}
    * role : needs to be a String, received: ${role}`
}

export const generateProductsErrorInfo = ({ title, description, price, thumbnail, code, stock, status, category }) => {
    return `One or more properties were incomplete or not valid.
    List of required properties:
    * title : needs to be a String, received: ${title}
    * description : needs to be a String, received: ${description}
    * price : needs to be a String, received: ${price}
    * thumbnail : needs to be a String, received: ${thumbnail}
    * code : needs to be a String, received: ${code}
    * stock : needs to be a String, received: ${stock}
    * status : needs to be a String, received: ${status}
    * category : needs to be a String, received: ${category}`
}

export const generateProductsMockingErrorInfo = (product) => {
    return `One or more properties were incomplete or not valid.
    List of required properties:
    * title : needs to be a String, received: ${product.title}
    * description : needs to be a String, received: ${product.description}
    * price : needs to be a String, received: ${product.price}
    * thumbnail : needs to be a String, received: ${product.thumbnail}
    * code : needs to be a String, received: ${product.code}
    * stock : needs to be a String, received: ${product.stock}
    * _id : needs to be a String, received: ${product._id}
    * category : needs to be a String, received: ${product.category}`
}

export const generateTicketErrorInfo = ({code, purchase_datetime, amount, purchaser}) => {
    return `One or more properties were incomplete or not valid.
    List of required properties:
    * code : needs to be a String, received: ${code}
    * purchase_datetime : needs to be a String, received: ${purchase_datetime}
    * amount : needs to be a String, received: ${amount}
    * purchaser : needs to be a String, received: ${purchaser}`
}

export const generateResetPassErrorInfo = ({token, newPassword, confirmNewPassword}) => {
    return `One or more properties were incomplete or not valid.
    List of required properties:
    * token : needs to be a String, received: ${token}
    * newPassword : needs to be a String, received: ${newPassword}
    * confirmNewPassword : needs to be a String, received: ${confirmNewPassword}`
}

export const generateDiferentPassError = ({newPassword, confirmNewPassword}) => {
    return `One or more properties are incomplete or are different.
    List of required properties:
    * newPassword : needs to be a String, received: ${newPassword}
    * confirmNewPassword : needs to be a String, received: ${confirmNewPassword}`
}
export const generateUpdateRoleErrorInfo = ({id, updateRole}) => {
    return `One or more properties are incomplete or are different.
    List of required properties:
    * id : needs to be a String, received: ${id}
    * updateRole : needs to be a String, received: ${updateRole}`
}
export const generateUpdateRoleUserErrorInfo = ({identification, adress, statusBank}) => {
    return `One or more properties are incomplete or are different.
    List of required properties:
    * identification : needs to be a String, received: ${identification}
    * adress : needs to be a String, received: ${adress}
    * statusBank : needs to be a String, received: ${statusBank}`
}