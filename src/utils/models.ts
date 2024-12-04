export interface encrypted {
    encrypt_data:string;
    nonce:string;
    authTag:string;
}

export interface configtype{
    jwt:{
        access:{
            secret:string;
            expireIn:string | undefined;
            cookie:{
                name?:string | undefined;
                httpOnly:boolean;
                secure:boolean;
                sameSite:boolean;
                domain:string | undefined;
                maxAge?:number;
            };
        }
        refresh:{
            secret:string;
            expireIn:string| undefined;
            cookie:{
                name:string | undefined;
                httpOnly:boolean;
                secure:boolean;
                sameSite:boolean;
                domain:string | undefined;
                maxAge?:number;
            };
        }
    }
}
