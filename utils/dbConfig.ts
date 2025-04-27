import mongo from "mongoose"
import { connect } from "mongoose";
export const dbConfig = async() => {
try {
     await connect(process.env.MONGO_URL  as string).then(() =>{
        console.clear()
        console.log("DB CONNECTED👍✌🤞...");
        
    })
} catch (error:any) {
    return error
}
}