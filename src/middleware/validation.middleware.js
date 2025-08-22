export const isValid = (schema)=>{
    return (req,res,next)=>{
       let data = {...req.body ,...req.params,...req.query};
       
       const { value, error } = schema.validate(data, { abortEarly: false })
       if (error) {
           let errorMessage = error.details.map((err) => err.message).join(", ")
           throw new Error(errorMessage, { cause: 400 })
       }
       next()
}}