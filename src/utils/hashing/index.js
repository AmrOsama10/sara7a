import bcrypt from "bcrypt";
export const comparePassword = (password, hashPassword) => {
    return bcrypt.compareSync(password, hashPassword)
}
    
export const hashPassword = (password) => {
    return bcrypt.hashSync(password, 10)
}