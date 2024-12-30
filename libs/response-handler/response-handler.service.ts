import { Injectable } from '@nestjs/common';
import { ERROR_CODES, ErrorMessages } from '../constants/commonConstants';
import { ApiResponse } from '../interfaces/commonTypes/apiResponse.interface';

@Injectable()
export class ResponseHandlerService {
  sendSuccessResponse(res: any, response: ApiResponse.ApiOK) {
    // response.status_code = 200;
    // response.success = true;
    res.status(200).json(response);
  }

  sendErrorResponse(res: any, errorBody: ApiResponse.ApiErrorType) {
    console.error('Error Response: ', JSON.stringify(errorBody));

    if (!errorBody.status_code || !errorBody.message) {
      errorBody.status_code = ERROR_CODES.UNEXPECTED_ERROR;
      errorBody.message = ErrorMessages.UNEXPECTED_ERROR;
    }

    const body: ApiResponse.ApiResponseType = {
      status_code: errorBody.status_code,
      message: errorBody.message,
      data: undefined,
      extraError: errorBody.extraError,
      success: false
    };
    res.status(errorBody.status_code).json(body);
  }
}
