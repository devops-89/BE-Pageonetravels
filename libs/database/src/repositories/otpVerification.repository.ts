import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpVerification } from '../entities/otpVerification.entity';
import { OtpVerificationI } from '../../../interfaces/authentication/OtpVerification.interface';
import { User } from '../entities/user.entity';
import { OTP_TYPE } from '../../../constants/autenticationConstants/userContants';

@Injectable()
export class OtpVerificationService {
  constructor(
    @InjectRepository(OtpVerification)
    private readonly otpVerificationRepository: Repository<OtpVerification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async addOtpVerificationRequest(input: OtpVerificationI.VerifyOtpRequest): Promise<number> {
    try {
      const { otp, expiryTime, otpType, emailOrPhone, sendOn, countryCode, user: userId } = input;

      const user = await this.userRepository.findOne({ where: { id: userId } });

      const updateValue: any = {
        otp,
        expiryTime,
        emailOrPhone,
        otpType,
        user,
        sendOn,
      };

      if (countryCode) {
        updateValue.countryCode = countryCode;
      }

      let insertedId: number | undefined;
      const oldOtp = await this.otpVerificationRepository.findOne({ where: { otpType, user: { id: userId } }, loadRelationIds: true });

      if (oldOtp) {
        insertedId = oldOtp.id;
        await this.otpVerificationRepository.update({ otpType, user: { id: userId } }, updateValue);
      } else {
        const insertResult = await this.otpVerificationRepository.insert(updateValue);

        const otpres = JSON.parse(JSON.stringify(insertResult));
        if (otpres.identifiers && otpres.identifiers.length > 0 && otpres.identifiers[0].id) 
        {
            insertedId = otpres.identifiers[0].id
        }
      }

      return insertedId ?? 0;
    } catch (error) {
      throw error;
    }
  }

  async getVerificationOtpDataByReferenceId(referenceId: number): Promise<OtpVerificationI.OtpVerificationSchema  | null> {
    const doc = await this.otpVerificationRepository.findOne({ where: { id: referenceId }, loadRelationIds: true });
    return doc as any || null;
  }

  async getOtpRequestByIdAndType(referenceId: number, otpType: OTP_TYPE): Promise<OtpVerificationI.OtpVerificationSchema  | null> {
    const doc = await this.otpVerificationRepository.findOne({ where: { id: referenceId, otpType }, loadRelationIds: true });
    return doc as any || null;
  }

  async removeVerificationOtpDataByReferenceId(referenceId: number): Promise<any> {
    const doc = await this.otpVerificationRepository.delete({ id: referenceId });
    return doc;
  }
}
