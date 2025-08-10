export const isValid = (schema)=>{
    
   return (req,res,next)=>{
       const { value, error } = schema.validate(req.body, { abortEarly: false })
       if (error) {
           let errorMessage = error.details.map((err) => err.message).join(", ")
           throw new Error(errorMessage, { cause: 400 })
       }
       next()
}}