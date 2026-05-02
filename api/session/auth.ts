import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { verifySessionToken } from "./session";
import { findUserByUnionId, findUserById } from "../queries/users";

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (token == null) { console.warn("[auth] No session cookie."); throw Errors.forbidden("Invalid auth token."); }
  const claim = await verifySessionToken(token);
  if (claim == null) { throw Errors.forbidden("Invalid auth token."); }
  if (claim.unionId) {
    const user = await findUserByUnionId(claim.unionId);
    if (user == null) { throw Errors.forbidden("User not found."); }
    return user;
  }
  if (claim.userId) {
    const user = await findUserById(claim.userId);
    if (user == null) { throw Errors.forbidden("User not found."); }
    return user;
  }
  throw Errors.forbidden("Invalid session token.");
}
