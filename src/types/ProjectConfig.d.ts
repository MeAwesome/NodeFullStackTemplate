export type ProjectConfig = {
    /**
     * The name of the project
     *
     * default: "NodeFullStackTemplate"
     */
    PROJECT_NAME: string;
    /**
     * The project description
     *
     * default: "MeAwesome's Node Full Stack Template"
     */
    PROJECT_DESCRIPTION: string;
    /**
     * The version of the project
     *
     * default: "1.0.0"
     */
    PROJECT_VERSION: string;
    /**
     * The project author
     *
     * default: "Isaac Robbins (MeAwesome) <isaacprobbins@gmail.com>""
     */
    PROJECT_AUTHOR: string;
    /**
     * The project repository
     *
     * default: "https://github.com/MeAwesome/NodeFullStackTemplate"
     */
    PROJECT_REPOSITORY: string;
    /**
     * Whether to log to the console
     *
     * default: true
     */
    CONSOLE_LOG: boolean;
    /**
     * The log level for the console
     *
     * default: "DEBUG"
     */
    CONSOLE_LOG_LEVEL: string;
    /**
     * Whether to log to a file
     *
     * default: false
     */
    FILE_LOG: boolean;
    /**
     * The log level for the file
     *
     * default: "DEBUG"
     */
    FILE_LOG_LEVEL: string;
    /**
     * The path to the log file
     *
     * default: "./data/logs/NodeFullStackTemplate.log"
     */
    FILE_LOG_PATH: string;
};
