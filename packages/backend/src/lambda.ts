import serverlessExpress from '@vendia/serverless-express';
import app from './app';
import { Handler, Context, Callback, APIGatewayProxyEvent } from 'aws-lambda';

let cachedServer: Handler;


async function bootstrap() {
    cachedServer = serverlessExpress({ app });
    return cachedServer;
}
async function getServer(): Promise<Handler> {
    cachedServer = cachedServer ?? (await bootstrap());
    return cachedServer;
}

export const handler: Handler = async (
    event: any,
    context: Context,
    callback: Callback
) => {
    // For HTTP API v2.0 format, use rawPath and strip the stage prefix
    if (event.version === '2.0' && event.rawPath) {
        // Strip the stage prefix from rawPath
        if (event.rawPath.startsWith('/prod/')) {
            event.rawPath = event.rawPath.substring(5); // Remove '/prod' prefix
        }
        // Also update the requestContext.http.path
        if (event.requestContext?.http?.path && event.requestContext.http.path.startsWith('/prod/')) {
            event.requestContext.http.path = event.requestContext.http.path.substring(5);
        }
    }
    
    const server = await getServer();
    return server(event, context, callback);
};