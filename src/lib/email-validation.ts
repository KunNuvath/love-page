/**
 * Strict Email Validation & Anti-Fake Account Utilities
 * Blocks random gibberish emails, disposable/temporary email providers,
 * and catches common typos in major email providers (like Gmail).
 */

// Known disposable / temporary / fake email domains
const DISPOSABLE_DOMAINS = new Set([
  // Testing & placeholder domains
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "testing.com",
  "fake.com",
  "fakemail.com",
  "random.com",
  "none.com",
  "null.com",
  "invalid.com",
  "localhost",
  "abc.com",
  "xyz.com",
  "123.com",
  "asdf.com",
  "qwerty.com",
  "domain.com",
  "email.com",
  "sample.com",
  // Disposable email services
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "10minutemail.com",
  "10minutemail.net",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "trashmail.com",
  "trashmail.net",
  "sharklasers.com",
  "getnada.com",
  "nada.email",
  "fakeinbox.com",
  "throwawaymail.com",
  "maildrop.cc",
  "dispostable.com",
  "mailnesia.com",
  "mohmal.com",
  "tempail.com",
  "emailondeck.com",
  "mintemail.com",
  "mytemp.email",
  "burnermail.io",
  "inboxkitten.com",
  "tempmailo.com",
  "mailcatch.com",
  "harakirimail.com",
  "jetable.org",
  "spamgourmet.com",
  "33mail.com",
  "mailpoof.com",
  "crazymailing.com",
  "discard.email",
  "discardmail.com",
  "tempmailaddress.com",
  "tmpmail.net",
  "tmpmail.org",
]);

// Common typos for popular email providers
const DOMAIN_TYPO_SUGGESTIONS: Record<string, string> = {
  // Gmail typos
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.om": "gmail.com",
  "gmail.c": "gmail.com",
  "gmaill.com": "gmail.com",
  "ggmail.com": "gmail.com",
  "gmailcom": "gmail.com",
  // Yahoo typos
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yhoo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  // Hotmail / Outlook typos
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlok.com": "outlook.com",
  "outllook.com": "outlook.com",
  "outlook.co": "outlook.com",
  "outlook.con": "outlook.com",
  // iCloud typos
  "iclod.com": "icloud.com",
  "icoud.com": "icloud.com",
  "icloud.co": "icloud.com",
  "icloud.con": "icloud.com",
};

// Trusted major email providers (fast-path for MX verification)
export const TRUSTED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.fr",
  "yahoo.co.jp",
  "outlook.com",
  "hotmail.com",
  "hotmail.co.uk",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "pm.me",
  "zoho.com",
  "gmx.com",
  "gmx.de",
  "mail.com",
  "yandex.com",
  "fastmail.com",
]);

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
  normalizedEmail: string;
  domain: string;
}

/**
 * Validates an email address format, checks for typos, and blocks fake/disposable domains.
 * Safe to run on both client and server.
 */
export function validateEmailFormat(rawEmail: string): EmailValidationResult {
  const normalizedEmail = (rawEmail || "").trim().toLowerCase();

  if (!normalizedEmail) {
    return {
      valid: false,
      error: "Please enter your email address.",
      normalizedEmail: "",
      domain: "",
    };
  }

  // Standard strict RFC-like format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalizedEmail)) {
    return {
      valid: false,
      error: "Please enter a valid email address (e.g. yourname@gmail.com).",
      normalizedEmail,
      domain: "",
    };
  }

  const [localPart, domain] = normalizedEmail.split("@");

  if (!localPart || !domain) {
    return {
      valid: false,
      error: "Please enter a valid email address.",
      normalizedEmail,
      domain: "",
    };
  }

  // Local part checks
  if (localPart.length < 2) {
    return {
      valid: false,
      error: "Email username is too short. Please use your real email address.",
      normalizedEmail,
      domain,
    };
  }

  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    return {
      valid: false,
      error: "Invalid email format. Please check for extra dots.",
      normalizedEmail,
      domain,
    };
  }

  // Check for typo in popular email providers
  if (DOMAIN_TYPO_SUGGESTIONS[domain]) {
    const suggested = DOMAIN_TYPO_SUGGESTIONS[domain];
    return {
      valid: false,
      error: `Did you mean ${localPart}@${suggested}? Please check your email spelling.`,
      normalizedEmail,
      domain,
    };
  }

  // Check disposable / fake domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: "Temporary or fake email addresses are not allowed. Please use your real email (e.g. Gmail).",
      normalizedEmail,
      domain,
    };
  }

  // Check domain structure (must have valid segments and non-numeric TLD)
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];
  const sld = domainParts[0];

  if (domainParts.some((part) => !part || part.startsWith("-") || part.endsWith("-"))) {
    return {
      valid: false,
      error: "Invalid email domain format.",
      normalizedEmail,
      domain,
    };
  }

  if (sld.length < 2 || tld.length < 2 || /^\d+$/.test(tld)) {
    return {
      valid: false,
      error: "Please enter a real email domain (e.g. @gmail.com).",
      normalizedEmail,
      domain,
    };
  }

  // Block obvious fake test local parts when paired with suspicious patterns
  const obviousFakeLocals = new Set([
    "fake",
    "fakemail",
    "noemail",
    "none",
    "null",
    "asdf",
    "asdfgh",
    "asdfghjkl",
    "qwerty",
    "qwertyuiop",
    "12345",
    "123456",
    "12345678",
    "123456789",
    "random",
    "nobody",
    "someone",
    "anonymous",
  ]);

  if (obviousFakeLocals.has(localPart)) {
    return {
      valid: false,
      error: "That looks like a placeholder email. Please enter your real email address to receive your verification code.",
      normalizedEmail,
      domain,
    };
  }

  return {
    valid: true,
    normalizedEmail,
    domain,
  };
}
