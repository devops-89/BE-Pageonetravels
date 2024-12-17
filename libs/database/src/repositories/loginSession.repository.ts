import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginSession } from '../entities/loginSession.entity';
import { LoginSessionI } from '../../../interfaces/authentication/loginSession.interface';
import { User } from '../entities/user.entity';
import { LOGIN_BY, SESSION_STATUS } from '../../../constants/autenticationConstants/userContants';

@Injectable()
export class LoginSessionService {
    constructor(
        @InjectRepository(LoginSession)
        private readonly sessionRepository: Repository<LoginSession>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async insertLoginSession(input: LoginSessionI.insertLoginSession): Promise<LoginSessionI.LoginSessionSchema> {
        try {
            const { loginStatus, refresh_token, refreshTokenExpiry, userId, loginIdentity, loginBy ,fcmToken, deviceType} = input;

            const user = await this.userRepository.findOne({ where: { id: userId } });

            const newSession = this.sessionRepository.create({
                loginStatus,
                refresh_token,
                refreshTokenExpiry,
                user,
                loginIdentity,
                loginBy,
                fcmToken,
                deviceType
            });

            const res = await this.sessionRepository.save(newSession);
            return res as any;
        } catch (error) {
            throw error;
        }
    }

    async getLoginSession(session_id: string): Promise<LoginSessionI.LoginSessionSchema | null> {
        try {
            const session = await this.sessionRepository.findOne({ where: { id: session_id } });
            return (session as any) || null;
        } catch (error) {
            throw error;
        }
    }

    async logoutCurrentSession(session_id: string): Promise<void> {
        try {
            // await this.sessionRepository.update(session_id, { loginStatus: SESSION_STATUS.LOGGED_OUT , fcmToken: null });
            await this.sessionRepository.delete(session_id);
        } catch (error) {
            throw error;
        }
    }

    async logoutAllSessionDb(userId: string): Promise<void> {
        try {
            // await this.sessionRepository.update({ user: { id: userId } }, { loginStatus: SESSION_STATUS.LOGGED_OUT });
            await this.sessionRepository.delete({ user: { id: userId } });
        } catch (error) {
            throw error;
        }
    }

    async logoutAllEmailSessionDb(userId: string, email: string): Promise<void> {
        try {
            // await this.sessionRepository.update({ user: { id: userId }, loginBy: LOGIN_BY.EMAIL, loginIdentity: email }, { loginStatus: SESSION_STATUS.LOGGED_OUT });
            await this.sessionRepository.delete( { user: { id: userId }, loginBy: LOGIN_BY.EMAIL, loginIdentity: email });

        } 
        catch (error) {
            throw error;
        }
    }

    async logoutAllPhoneSessionDb(userId: string, phone_no: string): Promise<void> {
        try {
            await this.sessionRepository.update({ user: { id: userId }, loginBy: LOGIN_BY.PHONE, loginIdentity: phone_no }, { loginStatus: SESSION_STATUS.LOGGED_OUT });
        } catch (error) {
            throw error;
        }
    }

    async getLoginSessionByRefreshToken(refresh_token: string, session_id: string): Promise<LoginSession | null> {
        try {
            const session = await this.sessionRepository.findOne({ where: { refresh_token, id: session_id } });
            return session || null;
        } catch (error) {
            throw error;
        }
    }

    async checkLoginSession(session_id: string) {
        let success = false;
        if (!session_id) {
            return true;
        }
        const session = await this.getLoginSession(session_id);
        if (session && session.loginStatus == SESSION_STATUS.LOGGED_IN) {
            success = true;
        }

        return success;
    }

    async blockAllSessionDb(userId: string): Promise<void> {
        try {
            await this.sessionRepository.update({ user: { id: userId } }, { loginStatus: SESSION_STATUS.BLOCKED });
        } catch (error) {
            throw error;
        }
    }

    async getAllSessionByUserId(userId: string): Promise<LoginSession[]> {
        try {
            const session = await this.sessionRepository.find({ where: { user: { id: userId}, loginStatus: SESSION_STATUS.LOGGED_IN } });
            return session;
        } 
        catch (error) {
            throw error;
        }
    }
}


