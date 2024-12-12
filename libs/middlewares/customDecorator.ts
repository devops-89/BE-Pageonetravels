import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TokenType = createParamDecorator((tokenType: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Extract tokenType from the request, you might need to adjust this logic based on how tokenType is provided in your request
    // const tokenType = request.headers.tokenType; // assuming tokenType is in the request headers
    console.log("tokenType", tokenType)
    request.tokenType = tokenType; // set tokenType on the request object
    return tokenType;
  },
);