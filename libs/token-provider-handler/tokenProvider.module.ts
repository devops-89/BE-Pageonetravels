import {Module} from "@nestjs/common";
import {TokenProviderService} from './tokenProvider.service';
import {RedisCacheServiceModule} from '../redis-cache-service/redis-cache-module';
import {TBO_CredentialsService} from '../loadtbo-db-config/tbo-config.service';

@Module({
    imports:[RedisCacheServiceModule],
    controllers:[],
    providers:[TokenProviderService,TBO_CredentialsService],
    exports:[TokenProviderService]
})
export class TokenProviderModule{}
