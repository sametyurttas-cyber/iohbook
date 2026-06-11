import * as Sentry from "@sentry/nextjs";

type ObservabilityContext = Record<string, string | number | boolean | null | undefined>;

function cleanContext(context: ObservabilityContext = {}) {
  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined)
  );
}

export function logInfo(message: string, context?: ObservabilityContext) {
  const data = cleanContext(context);
  console.info(JSON.stringify({ level: "info", message, ...data }));
  Sentry.addBreadcrumb({
    category: "app",
    data,
    level: "info",
    message
  });
}

export function logWarning(message: string, context?: ObservabilityContext) {
  const data = cleanContext(context);
  console.warn(JSON.stringify({ level: "warn", message, ...data }));
  Sentry.addBreadcrumb({
    category: "app",
    data,
    level: "warning",
    message
  });
}

export function captureError(error: unknown, context?: ObservabilityContext) {
  const data = cleanContext(context);
  const normalizedError = error instanceof Error ? error : new Error(String(error));
  console.error(JSON.stringify({ level: "error", message: normalizedError.message, ...data }));
  Sentry.captureException(normalizedError, {
    contexts: {
      app: data
    }
  });
}

export async function observeAsync<T>(
  name: string,
  context: ObservabilityContext,
  operation: () => Promise<T>
) {
  const startedAt = Date.now();
  logInfo(`${name}.started`, context);

  try {
    const result = await operation();
    logInfo(`${name}.succeeded`, {
      ...context,
      duration_ms: Date.now() - startedAt
    });
    return result;
  } catch (error) {
    captureError(error, {
      ...context,
      duration_ms: Date.now() - startedAt,
      operation: name
    });
    throw error;
  }
}
