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

  async removeVerificationOtpDataByReferenceId(reference_id: string): Promise<any> {
    const doc = await this.otpVerificationRepository.delete({ id: reference_id });
    return doc;
  }

  async getVerificationOtpDataByReferenceId(reference_id: string) {
    const doc = await this.otpVerificationRepository.findOne({ where: { id: reference_id }, loadRelationIds: true });
    return doc as any || null;
  }

  async addOtpVerificationRequest(input: OtpVerificationI.VerifyOtpRequest): Promise<number> {
    try {
      const { otp, expiryTime, otpType, emailOrPhone, sendOn, reference_id, user: userId } = input;

      const user = await this.userRepository.findOne({ where: { id: String(userId) } });

      const updateValue: any = {
        otp,
        expiryTime,
        emailOrPhone,
        otpType,
        user,
        sendOn,
      };

      if (reference_id) {
        updateValue.reference_id = reference_id;
      }

      let insertedId: string | undefined;
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

      return insertedId as any;
    } catch (error) {
      throw error;
    }
  }
 

  // async getOtpRequestByIdAndType(reference_id: number, otpType: OTP_TYPE): Promise<OtpVerificationI.OtpVerificationSchema  | null> {
  //   const doc = await this.otpVerificationRepository.findOne({ where: { id: reference_id, otpType }, loadRelationIds: true });
  //   return doc as any || null;
  // }

}
