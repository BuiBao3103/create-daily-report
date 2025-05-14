import { isNotEmpty } from "@mantine/form";

export function U0MyValidateEmpty(message?: string) {
  return isNotEmpty(message ? message : "Không được để trống")
}

export function U0MyValidateEmail(value?: string) {
  return /^\S+@\S+$/.test(value!) ? null : "Email không đúng định dạng";
}
