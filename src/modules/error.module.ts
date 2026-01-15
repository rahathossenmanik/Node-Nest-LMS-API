import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from 'src/filters/exceptions.filter';

@Module({
    imports: [],
    controllers: [],
    providers: [{
        provide: APP_FILTER,
        useClass: AllExceptionsFilter,
    }],
})
export class ErrorModule { }
