import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TokenType = createParamDecorator((token_type: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Extract token_type from the request, you might need to adjust this logic based on how token_type is provided in your request
    // const token_type = request.headers.token_type; // assuming token_type is in the request headers
    console.log("token_type", token_type)
    request.token_type = token_type; // set token_type on the request object
    return token_type;
  },
);