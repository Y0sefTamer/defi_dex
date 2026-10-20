import { BaseError } from "viem";

export function getErrorMessage(error: unknown): string {
  if (error instanceof BaseError) {
    return error.shortMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}
