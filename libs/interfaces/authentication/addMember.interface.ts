import { DEFAULT_USER_ROLES, INVITE_MEMBER, INVITE_STATUS } from "../../constants/autenticationConstants/userContants"

export declare namespace MemberI 
{

    interface DefaultField
    {
        _id: string
        createdAt:Date,
        updatedAt:Date
    }


    interface AddMemberRequest {
        child: string,
        parent: string,
        inviteTo: INVITE_MEMBER,
        status: INVITE_STATUS
    }

    interface AddMemberRequestSchema extends AddMemberRequest, DefaultField
    { }
  
    type AddMemberRequestType = AddMemberRequestSchema & Document

    interface UpdateProfile 
    {
        password: string,
        phoneNo: string,
        name: string,
        countryCode: string,
        interest?: string[]
        // avatar
    }

    interface UpdateProfileRequest {
        salutation: string,
        fullName: string,
        userName: string,
        phoneNo: string,
        countryCode: string,
        password: string,
        socialLink?: {
            facebook: string,
            twitter: string,
        }
        birthDate: Date,
    }


    interface AddMember
    {
        salutation: string,
        fullName: string,
        email: string,
        birthDate: Date,
        // phoneNo: string,
        userRole: DEFAULT_USER_ROLES,
        roleId: string
    }
    
    interface MemberApprovalRequest
    {
      requestId: string,
      status: INVITE_STATUS.REJECTED | INVITE_STATUS.VERIFIED
    }
}