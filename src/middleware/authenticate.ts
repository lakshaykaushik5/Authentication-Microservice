import { config } from "../utils/tokenGeneration"
import jwt from "jsonwebtoken"

export const authenticate = async(req:any,res:any,next:any)=>{
    if(!config.jwt.access.cookie.name){
        console.log("Internal Middleware error");
        return
    }
    const accessToken = req.cookies[config.jwt.access.cookie.name];

    if(!accessToken){
        return res.status(404).json({msg:"accessToken Required"});
    }
    
    try {
        if(!config.jwt.access.secret)return
        const decode = jwt.verify(accessToken, config.jwt.access.secret);
        req.user = decode;
        next();
    } catch (error:any) {
        if(error.name == "TokenExpiredError"){
            return res.status(401).json({
                msg:"Access Token Expired",
                code:"TOKEN_EXPIRED"
            })
        }
        else{
            return res.status(400).json({msg:"Invalid Access Token"})
        }
    }
}