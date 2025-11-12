import { Connection } from 'typeorm';
export declare class AppController {
    private connection;
    constructor(connection: Connection);
    health(): Promise<{
        status: string;
        service: string;
        timestamp: string;
        database: string;
    }>;
}
