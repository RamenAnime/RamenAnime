import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { verifySessionToken } from "./session";
import { findUserByUnionId, findUserById } from "../queries/users";
import { logger } from "../lib/logger";

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    logger.warn("No session cookie found in request");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }

  let user;
  if (claim.unionId) {
    user = await findUserByUnionId(claim.unionId);
  } else if (claim.userId) {
    user = await findUserById(claim.userId);
  }

  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }

  if (user.isBanned) {
    throw Errors.forbidden("Your account has been suspended.");
  }

  return user;
}

