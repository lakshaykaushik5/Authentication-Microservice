import { PrismaClient } from "@prisma/client";
import { saltrounds, session_limit } from "../env";
import bcrypt from "bcryptjs";
import { SecureEncryption } from "../utils/SecureEncryption";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenGeneration";
import { UserData, UserDataRefresh } from "../utils/models";
import { config } from "../utils/tokenGeneration";
import { loginSchema, userSchema } from "../utils/zodSchema";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const signUp = async (req: any, res: any) => {
  try {
    const { encrypt_data, nonce, authTag } = req.body;
    const enc = new SecureEncryption();
    const {
      username,
      useremail,
      userpassword,
    }: { username: string; useremail: string; userpassword: string } =
        enc.decrypt({ encrypt_data, nonce, authTag });
    const result = userSchema.safeParse({
      name: username,
      useremail: useremail,
      password: userpassword,
    });
    if (!result.success) {
      res.status(404).json({
        data: {
          msg: "check password validation",
        },
      });
    }

    // hasing password

    const hash_password = bcrypt.hash(userpassword, saltrounds);

    const check_user = await prisma.master_users.findFirst({
      where: {
        usermail: useremail,
      },
    });

    if (check_user) {
      return res.status(404).json({ data: { msg: "user already exists" } });
    }

    const userRefresh: UserDataRefresh = {
      username: username,
      tokenVersion: 0,
    };

    const rtoken = generateRefreshToken(userRefresh);

    const create_user = await prisma.master_users.create({
      data: {
        username: username,
        usermail: useremail,
        userpassword: userpassword,
        status: true,
        updatedAt: new Date(),
        tokenCreatedAt: new Date(),
        refreshToken: rtoken,
        tokenVersion: 0,
        role: 1,
      },
    });

    const user: UserData = {
      id: create_user.id,
      username: create_user.username,
      role: create_user.role,
      tokenVersion: create_user.tokenVersion,
    };

    const atoken = generateAccessToken(user);

    res.cookie(config.jwt.access.cookie.name, atoken, config.jwt.access.cookie);

    res.cookie(
      config.jwt.refresh.cookie.name,
      rtoken,
      config.jwt.refresh.cookie,
    );

    res.status(200).json({
      msg: "SignIn Successfully",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const logIn = async (req: any, res: any) => {
  try {
    const { encrypt_data, nonce, authTag } = req.body;
    const enc = new SecureEncryption();
    const { useremail, password } = enc.decrypt({
      encrypt_data,
      nonce,
      authTag,
    });
    const input_check = loginSchema.safeParse({
      useremail: useremail,
      password: password,
    });

    if (!input_check.success) {
      res.status(400).json({ msg: "check validation" });
    }

    const data_user = await prisma.master_users.findFirst({
      where: {
        usermail: useremail,
      },
    });

    if (!data_user) {
      res.status(404).json({ msg: "user dosent exists" });
    }

    const userSession = await prisma.master_session.findMany({
      where: {
        userId: data_user?.id,
      },
    });

    if (userSession.length > session_limit) {
      return res.status(403).json({ msg: "user limit exceeded" });
    }

    const details: UserData = {
      id: data_user?.id!,
      username: data_user?.username!,
      role: data_user?.role!,
      tokenVersion: data_user?.tokenVersion! + 1,
    };

    const detailsToken: UserDataRefresh = {
      username: data_user?.username!,
      tokenVersion: data_user?.tokenVersion! + 1,
    };

    const atoken = generateAccessToken(details);
    const rtoken = generateRefreshToken(detailsToken);

    const updateTokenVersionInDb = await prisma.master_users.update({
      where: {
        id: data_user?.id,
      },
      data: {
        refreshToken: rtoken,
        tokenVersion: data_user?.tokenVersion! + 1,
      },
    });

    res.cookie(config.jwt.access.cookie.name, atoken, config.jwt.access.cookie);

    res.cookie(
      config.jwt.refresh.cookie.name,
      rtoken,
      config.jwt.refresh.cookie,
    );

    res.status(200).json({ msg: "Loged In successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const logout = async (req: any, res: any) => {
  try {
    const rname = config.jwt.access.cookie.name;
    const aname = config.jwt.refresh.cookie.name;
    if (!aname || !rname) {
      return;
    }

    const refreshToken = req.cookies[rname];

    const del_token = await prisma.master_users.update({
      where: {
        refreshToken: refreshToken,
      },
      data: {
        refreshToken: null,
      },
    });

    const del_session = await prisma.master_session.deleteMany({
      where:{
        userId: del_token.id,
      }
    })

    res.clearCookie(rname);
    res.clearCookie(aname);
    res.status(200).json({ msg: "Logout Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const refresh_token = async (req: any, res: any) => {
  try {
    if (!config.jwt.refresh.cookie.name || !config.jwt.refresh.secret) return;
    const refreshToken = req.cookies[config.jwt.refresh.cookie.name];
    if (!refreshToken) {
      return res.status(401).json({ msg: "Refresh Token required" });
    }

    const decode = jwt.verify(refreshToken, config.jwt.refresh.secret);

    const getRefreshTokenFromDb = await prisma.master_users.findFirst({
      where: {
        username: decode.username,
      },
    });

    const dbRefreshToken = getRefreshTokenFromDb?.refreshToken;
    if (
      dbRefreshToken !== refreshToken ||
      decode?.tokenVersion !== getRefreshTokenFromDb?.tokenVersion
    ) {
      return res.status(403).json({ msg: "Invalid Refresh Token" });
    }

    const user: UserData = {
      id: getRefreshTokenFromDb?.id!,
      username: getRefreshTokenFromDb?.username!,
      role: getRefreshTokenFromDb?.role!,
      tokenVersion: getRefreshTokenFromDb?.tokenVersion! + 1,
    };

    const userRefresh: UserDataRefresh = {
      username: getRefreshTokenFromDb?.username!,
      tokenVersion: getRefreshTokenFromDb?.tokenVersion! + 1,
    };

    const atoken = generateAccessToken(user);
    const rtoken = generateRefreshToken(userRefresh);

    const update_refresh_token = await prisma.master_users.update({
      where: {
        id: getRefreshTokenFromDb?.id,
      },
      data: {
        refreshToken: rtoken,
        tokenVersion: getRefreshTokenFromDb?.tokenVersion! + 1,
      },
    });

    res.cookie(config.jwt.access.cookie.name, atoken, config.jwt.access.cookie);

    res.cookie(
      config.jwt.refresh.cookie.name,
      rtoken,
      config.jwt.refresh.cookie,
    );

    return res.status(200).json({ msg: "Token Refreshed Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "internal server error" });
  }
};

export const logedDevices = async (req:any,res:any){
  try{
    const {encrypt_data,nonce,authTag} = req.body;
    const enc = new SecureEncryption();
    const { userId } = enc.decrypt({
      encrypt_data,
      nonce,
      authTag,
    });

    const sessionData = await prisma.master_session.findMany({
      where:{
        userId:userId
      }
    })

    if(!sessionData){
      return res.status(400).json({msg:"No Users found"})
    }

    return res.status(200).json({msg:"Sucess",data:sessionData})
    
  }catch(error){
    console.log(error);
    return res.status(500).json({msg:"Internal Server Error"});
  }
}

