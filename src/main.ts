import config from "@config";
import logger from "@logger";
import Server from "@/core/Server";

// Created with: https://patorjk.com/software/taag/
const LogLogo = `
   _.._
 .' .-'\` _____     _____                             
/  /    |     |___|  _  |_ _ _ ___ ___ ___ _____ ___ 
|  |    | | | | -_|     | | | | -_|_ -| . |     | -_|
\\  \\    |_|_|_|___|__|__|_____|___|___|___|_|_|_|___|
 '._'-._
    \`\`\``;

logger.info(`${LogLogo}
Welcome to ${config.PROJECT_NAME}!

${config.PROJECT_DESCRIPTION}

Author: ${config.PROJECT_AUTHOR}
Version: ${config.PROJECT_VERSION}
Repository: ${config.PROJECT_REPOSITORY}
`);

const server = new Server();

server.start();
