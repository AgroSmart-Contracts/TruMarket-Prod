type UnauthorizedHandler = () => void | Promise<void>;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export async function handleUnauthorized(): Promise<void> {
  if (unauthorizedHandler) {
    await unauthorizedHandler();
    return;
  }

  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}
