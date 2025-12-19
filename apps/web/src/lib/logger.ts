// Centralized logging utility
// Replaces console.log/error with proper logging that can be extended
// Supports external log shipping (CloudWatch, Datadog, LogRocket, etc.)

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
  };
}

class Logger {
  private logQueue: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly maxQueueSize = 100;
  private readonly flushIntervalMs = 5000; // 5 seconds

  constructor() {
    // Start periodic flush in production
    if (process.env.NODE_ENV === "production") {
      this.startFlushInterval();
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (process.env.NODE_ENV === "production") {
      // In production, only log errors and warnings
      return level === "error" || level === "warn";
    }
    // In development, log everything
    return true;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    error?: Error | unknown,
    context?: LogContext
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (error) {
      entry.error = error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { message: String(error) };
    }

    return entry;
  }

  private async shipLogs(logs: LogEntry[]): Promise<void> {
    if (logs.length === 0) return;

    // Ship to external services based on configuration
    const promises: Promise<void>[] = [];

    // CloudWatch (AWS)
    if (process.env.AWS_CLOUDWATCH_LOG_GROUP) {
      promises.push(this.shipToCloudWatch(logs));
    }

    // Datadog
    if (process.env.DATADOG_API_KEY) {
      promises.push(this.shipToDatadog(logs));
    }

    // LogRocket
    if (process.env.LOGROCKET_APP_ID && typeof window !== "undefined") {
      promises.push(this.shipToLogRocket(logs));
    }

    // Execute all shipping operations in parallel
    await Promise.allSettled(promises);
  }

  private async shipToCloudWatch(logs: LogEntry[]): Promise<void> {
    // CloudWatch Logs integration
    // 
    // To enable CloudWatch logging:
    // 1. Install: npm install @aws-sdk/client-cloudwatch-logs
    // 2. Set environment variables:
    //    - AWS_CLOUDWATCH_LOG_GROUP (required)
    //    - AWS_REGION (required)
    //    - AWS_ACCESS_KEY_ID (required)
    //    - AWS_SECRET_ACCESS_KEY (required)
    // 3. Uncomment and configure the code below

    try {
      const logGroupName = process.env.AWS_CLOUDWATCH_LOG_GROUP;
      const region = process.env.AWS_REGION || "us-east-1";

      if (!logGroupName) {
        if (process.env.NODE_ENV === "development") {
          console.debug(`[CloudWatch] Log group not configured, skipping ${logs.length} log entries`);
        }
        return;
      }

      const { CloudWatchLogsClient, PutLogEventsCommand } = await import("@aws-sdk/client-cloudwatch-logs");

      const client = new CloudWatchLogsClient({ region });

      const logStreamName = `app-logs-${new Date().toISOString().split('T')[0]}`;

      // Convert logs to CloudWatch format
      const logEvents = logs.map(log => ({
        timestamp: new Date(log.timestamp).getTime(),
        message: JSON.stringify({
          level: log.level,
          message: log.message,
          context: log.context,
          error: log.error,
        }),
      }));

      const command = new PutLogEventsCommand({
        logGroupName,
        logStreamName,
        logEvents,
      });

      await client.send(command);
    } catch (error) {
      console.error("Failed to ship logs to CloudWatch:", error);
      // Don't throw - logging failures shouldn't break the application
    }
  }

  private async shipToDatadog(logs: LogEntry[]): Promise<void> {
    // Datadog Logs API integration
    //
    // To enable Datadog logging:
    // 1. Set environment variables:
    //    - DATADOG_API_KEY (required)
    //    - DATADOG_SITE (optional, defaults to datadoghq.com)
    // 2. Uncomment and configure the code below

    try {
      const apiKey = process.env.DATADOG_API_KEY;
      const site = process.env.DATADOG_SITE || "datadoghq.com";

      if (!apiKey) {
        if (process.env.NODE_ENV === "development") {
          console.debug(`[Datadog] API key not configured, skipping ${logs.length} log entries`);
        }
        return;
      }

      // Convert logs to Datadog format
      const datadogLogs = logs.map(log => ({
        ddsource: "nodejs",
        ddtags: `env:${process.env.NODE_ENV || "development"},level:${log.level}`,
        hostname: process.env.HOSTNAME || "unknown",
        message: log.message,
        service: "nexuscanon-vendor-portal",
        status: log.level === "error" ? "error" : log.level === "warn" ? "warn" : "info",
        timestamp: new Date(log.timestamp).getTime(),
        ...(log.context && { attributes: log.context }),
        ...(log.error && { error: log.error }),
      }));

      // Send logs to Datadog Logs API
      const response = await fetch(`https://http-intake.logs.${site}/api/v2/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "DD-API-KEY": apiKey,
        },
        body: JSON.stringify(datadogLogs),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Datadog API error: ${response.status} ${errorText}`);
      }

      if (process.env.NODE_ENV === "development") {
        console.debug(`[Datadog] Shipped ${logs.length} log entries successfully`);
      }
    } catch (error) {
      console.error("Failed to ship logs to Datadog:", error);
      // Don't throw - logging failures shouldn't break the application
    }
  }

  private async shipToLogRocket(logs: LogEntry[]): Promise<void> {
    // LogRocket is client-side only
    if (typeof window === "undefined") return;

    try {
      // LogRocket would be initialized separately
      // This is just for structured log shipping
      if (process.env.NODE_ENV === "development") {
        console.debug(`[LogRocket] Would ship ${logs.length} log entries`);
      }
    } catch (error) {
      console.error("Failed to ship logs to LogRocket:", error);
    }
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);
  }

  private async flush(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const logsToShip = [...this.logQueue];
    this.logQueue = [];

    await this.shipLogs(logsToShip);
  }

  private addToQueue(entry: LogEntry): void {
    this.logQueue.push(entry);

    // Flush immediately for errors
    if (entry.level === "error") {
      this.flush();
    }

    // Prevent queue from growing too large
    if (this.logQueue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog("info")) {
      const entry = this.createLogEntry("info", message, undefined, context);
      console.log(this.formatMessage("info", message, context));
      this.addToQueue(entry);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog("warn")) {
      const entry = this.createLogEntry("warn", message, undefined, context);
      console.warn(this.formatMessage("warn", message, context));
      this.addToQueue(entry);
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog("error")) {
      const entry = this.createLogEntry("error", message, error, context);
      const errorDetails = error instanceof Error
        ? { message: error.message, stack: error.stack, ...context }
        : { error: String(error), ...context };
      console.error(this.formatMessage("error", message, errorDetails));
      this.addToQueue(entry);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog("debug")) {
      const entry = this.createLogEntry("debug", message, undefined, context);
      console.debug(this.formatMessage("debug", message, context));
      this.addToQueue(entry);
    }
  }

  // Manual flush for graceful shutdown
  async flushLogs(): Promise<void> {
    await this.flush();
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }
}

export const logger = new Logger();

// Convenience functions
export const logInfo = (message: string, context?: LogContext) => logger.info(message, context);
export const logWarn = (message: string, context?: LogContext) => logger.warn(message, context);
export const logError = (message: string, error?: Error | unknown, context?: LogContext) =>
  logger.error(message, error, context);
export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context);

// Export flush function for graceful shutdown
export const flushLogs = () => logger.flushLogs();
