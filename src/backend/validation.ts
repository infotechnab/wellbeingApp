const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;

/** Returns an error message, or null when the credentials can be sent. */
export function validateCredentials(email: string, password: string): string | null {
  if (!EMAIL.test(email.trim())) return 'Please enter a valid email address.';
  if (password.length < MIN_PASSWORD_LENGTH) return `Please use a password of at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}
