import { Injectable } from '@nestjs/common';
import { ERROR_CODES, ErrorMessages } from '../constants/commonConstants';
import { ApiResponse } from '../interfaces/commonTypes/apiResponse.interface';

@Injectable()
export class ResponseHandlerService {
  sendSuccessResponse(res: any, response: ApiResponse.ApiOK) {
    // response.statusCode = 200;
    // response.success = true;
    res.status(200).json(response);
  }

  sendErrorResponse(res: any, errorBody: any) {
    console.error('Error Response: ', JSON.stringify(errorBody),
    errorBody.statusCode,
    errorBody.message);

    if (!errorBody.statusCode || !errorBody.message) {
      console.log("i amiffff");
      errorBody.statusCode = ERROR_CODES.UNEXPECTED_ERROR;
      errorBody.message = ErrorMessages.UNEXPECTED_ERROR;
    }

    const body: ApiResponse.ApiResponseType = {
      statusCode: errorBody.statusCode,
      message: errorBody.message,
      data: undefined,
      extraError: errorBody.extraError,
      success: false
    };
    res.status(errorBody.statusCode).json(body);
  }
}
