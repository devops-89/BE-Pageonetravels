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
  ) { }

  async getVerificationOtpDataByReferenceId(reference_id: string) {
    try {
      const doc = await this.otpVerificationRepository.findOne({ where: { id: reference_id }, loadRelationIds: true });
      return doc as any || null;
    } catch (error) {
      throw error;
    }
  }

  
  async getOtpRequestByIdAndType(reference_id: string, otp_type: OTP_TYPE): Promise<OtpVerificationI.OtpVerificationSchema | null> {
    try {
      const doc = await this.otpVerificationRepository.findOne({ where: { id: reference_id, otp_type }, loadRelationIds: true });
      return doc as any || null;
    } catch (error) {
      throw error;
    }
  }


  async removeVerificationOtpDataByReferenceId(reference_id: string): Promise<any> {
    try {
      const doc = await this.otpVerificationRepository.delete({ id: reference_id });
      return doc;
    } catch (error) {
      throw error;
    }
  }


async addOtpVerificationRequest(input: OtpVerificationI.VerifyOtpRequest): Promise<number> {
    try {    
      const { otp, expiry_time, otp_type, email_or_phone, send_on, country_code, user: user_id } = input;

      const userRef = new User();
      userRef.id = user_id;

      const updateValue: any = {
        otp,
        expiry_time,
        email_or_phone,
        otp_type,
        user: userRef,
        send_on,
      };

      if (country_code) {
        updateValue.country_code = country_code;
      }

      let insertedId: string | undefined;
      const oldOtp = await this.otpVerificationRepository.findOne({ where: { otp_type, user: { id: user_id } }, loadRelationIds: true });
      
      if (oldOtp) {
        
        insertedId = oldOtp.id; 
        await this.otpVerificationRepository.update({ otp_type, user: { id: user_id } }, updateValue);
      } else {
        const insertResult = await this.otpVerificationRepository.insert(updateValue);
        const otpres = JSON.parse(JSON.stringify(insertResult));
        if (otpres.identifiers && otpres.identifiers.length > 0 && otpres.identifiers[0].id) {
          insertedId = otpres.identifiers[0].id
          
        }
      }
      
      return insertedId as any;
    } catch (error) {
      throw error;
    }
  }
}
