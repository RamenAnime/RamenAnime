export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push("At least 8 characters required");
  if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter required");
  if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter required");
  if (!/\d/.test(password)) errors.push("At least one number required");
  if (!/[@$!%*?&]/.test(password)) errors.push("At least one special character required");
  return { valid: errors.length === 0, errors };
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) return { valid: false, error: "Username must be at least 3 characters" };
  if (username.length > 50) return { valid: false, error: "Username must be 50 characters or fewer" };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: "Username may only contain letters, numbers, and underscores" };
  }
  return { valid: true };
}
