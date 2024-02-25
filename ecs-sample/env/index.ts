export const environments = ["develop", "staging", "production"] as const;

export function isValidEnvironment(environment: string): boolean {
  return environment in environments;
}
