export interface encrypted {
    encrypt_data: string;
    nonce: string;
    authTag: string;
}

export interface Cookie {
    name?: string | undefined;
    httpOnly: boolean;
    secure: boolean;
    sameSite: boolean;
    domain: string | undefined;
    maxAge?: number;
}

export interface UserData {
    id: number;
    username: string;
    role: number;
    tokenVersion: number;
}

export interface UserDataRefresh {
    username: string;
    tokenVersion: number;
}

export interface configtype {
    jwt: {
        access: {
            secret: string;
            expireIn: string | undefined;
            cookie: Cookie;
        };
        refresh: {
            secret: string;
            expireIn: string | undefined;
            cookie: Cookie;
        };
    };
}
