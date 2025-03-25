import jwt from "jsonwebtoken";
import { configtype } from "./models";

export const config: configtype = {
    jwt: {
        access: {
            secret: process.env.ACCESS_TOKEN_SECRET!,
            expireIn: process.env.ACCESS_TOKEN_EXPIRY,
            cookie: {
                name: "accessToken",
                httpOnly: true,
                secure: process.env.MODE_ENV === "prod",
                sameSite: true,
                domain: process.env.COOKIE_DOMAIN,
                maxAge: Number(process.env.ACCESS_TOKEN_EXPIRY),
            },
        },
        refresh: {
            secret: process.env.REFRESH_TOKEN_SECRET!,
            expireIn: process.env.REFRESH_TOKEN_EXPIRY,
            cookie: {
                name: "refreshToken",
                httpOnly: true,
                secure: process.env.MODE_ENV === "prod",
                sameSite: true,
                domain: process.env.COOKIE_DOMAIN,
                maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY),
            },
        },
    },
};

export const generateAccessToken = (user: any) => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        return "no secret key";
    }

    const token = jwt.sign(
        {
            userId: user.id,
            username: user.username,
            role: user.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: config.jwt.access.expireIn,
        },
    );
    return token;
};

export const generateRefreshToken = (user: any) => {
    if (!process.env.REFRESH_TOKEN_SECRET) {
        return "no secret key";
    }

    const refreshToken = jwt.sign(
        {
            username: user.username,
            tokenVersion: user.tokenVersion,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: config.jwt.refresh.expireIn,
        },
    );
    return refreshToken;
};
