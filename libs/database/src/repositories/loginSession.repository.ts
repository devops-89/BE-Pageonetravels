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
            const { loginStatus, refreshToken, refreshTokenExpiry, userId, loginIdentity, loginBy ,fcmToken, deviceType} = input;

            const user = await this.userRepository.findOne({ where: { id: userId } });

            const newSession = this.sessionRepository.create({
                loginStatus,
                refreshToken,
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

    async getLoginSession(sessionId: number): Promise<LoginSessionI.LoginSessionSchema | null> {
        try {
            const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
            return (session as any) || null;
        } catch (error) {
            throw error;
        }
    }

    async logoutCurrentSession(sessionId: number): Promise<void> {
        try {
            // await this.sessionRepository.update(sessionId, { loginStatus: SESSION_STATUS.LOGGED_OUT , fcmToken: null });
            await this.sessionRepository.delete(sessionId);
        } catch (error) {
            throw error;
        }
    }

    async logoutAllSessionDb(userId: number): Promise<void> {
        try {
            // await this.sessionRepository.update({ user: { id: userId } }, { loginStatus: SESSION_STATUS.LOGGED_OUT });
            await this.sessionRepository.delete({ user: { id: userId } });
        } catch (error) {
            throw error;
        }
    }

    async logoutAllEmailSessionDb(userId: number, email: string): Promise<void> {
        try {
            // await this.sessionRepository.update({ user: { id: userId }, loginBy: LOGIN_BY.EMAIL, loginIdentity: email }, { loginStatus: SESSION_STATUS.LOGGED_OUT });
            await this.sessionRepository.delete( { user: { id: userId }, loginBy: LOGIN_BY.EMAIL, loginIdentity: email });

        } 
        catch (error) {
            throw error;
        }
    }

    async logoutAllPhoneSessionDb(userId: number, phoneNo: string): Promise<void> {
        try {
            await this.sessionRepository.update({ user: { id: userId }, loginBy: LOGIN_BY.PHONE, loginIdentity: phoneNo }, { loginStatus: SESSION_STATUS.LOGGED_OUT });
        } catch (error) {
            throw error;
        }
    }

    async getLoginSessionByRefreshToken(refreshToken: string, sessionId: number): Promise<LoginSession | null> {
        try {
            const session = await this.sessionRepository.findOne({ where: { refreshToken, id: sessionId } });
            return session || null;
        } catch (error) {
            throw error;
        }
    }

    async checkLoginSession(sessionId: number) {
        let success = false;
        if (!sessionId) {
            return true;
        }
        const session = await this.getLoginSession(sessionId);
        if (session && session.loginStatus == SESSION_STATUS.LOGGED_IN) {
            success = true;
        }

        return success;
    }

    async blockAllSessionDb(userId: number): Promise<void> {
        try {
            await this.sessionRepository.update({ user: { id: userId } }, { loginStatus: SESSION_STATUS.BLOCKED });
        } catch (error) {
            throw error;
        }
    }

    async getAllSessionByUserId(userId: number): Promise<LoginSession[]> {
        try {
            const session = await this.sessionRepository.find({ where: { user: { id: userId}, loginStatus: SESSION_STATUS.LOGGED_IN } });
            return session;
        } 
        catch (error) {
            throw error;
        }
    }
}


