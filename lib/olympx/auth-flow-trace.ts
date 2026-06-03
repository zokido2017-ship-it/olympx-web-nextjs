import { AUTH_FLOW_DEBUG, authDebug } from "@/lib/olympx/auth-debug";
import {
  recordAuthFlowStep,
  setActiveFlowId,
} from "@/lib/olympx/auth-flow-tracer";
import { maskSessionToken } from "@/lib/olympx/session-store";

let flowCounter = 0;

export type AuthFlowStep =
  | "otp.validate.start"
  | "otp.validate.ok"
  | "otp.validate.fail"
  | "session.post.start"
  | "session.post.ok"
  | "session.post.fail"
  | "session.get.ok"
  | "session.get.miss"
  | "session.establish.start"
  | "session.establish.ok"
  | "session.establish.fail"
  | "session.establish.navigate"
  | "session.complete.ok"
  | "session.complete.fail"
  | "session.complete.navigate"
  | "middleware.allow"
  | "middleware.redirect_login"
  | "guard.redirect_login"
  | "navigate.post_login"
  | "logout";

function nextFlowId(): string {
  flowCounter += 1;
  return `af-${Date.now()}-${flowCounter}`;
}

let currentFlowId: string | null = null;

export function startAuthFlow(reason: string): string {
  currentFlowId = nextFlowId();
  setActiveFlowId(currentFlowId);
  trace("flow.start", { reason, flowId: currentFlowId });
  return currentFlowId;
}

export function trace(
  step: AuthFlowStep | string,
  extra?: Record<string, unknown>,
): void {
  recordAuthFlowStep(step, { flowId: currentFlowId, ...extra });
  if (!AUTH_FLOW_DEBUG) return;
  authDebug("trace", step, {
    flowId: currentFlowId,
    ...extra,
  });
}

export function traceToken(step: AuthFlowStep | string, token: string | null): void {
  trace(step, {
    hasToken: Boolean(token?.trim()),
    token: token ? maskSessionToken(token) : undefined,
  });
}
