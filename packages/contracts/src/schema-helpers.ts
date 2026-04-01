import { z } from "zod";

function nullToUndefined(value: unknown) {
  return value === null ? undefined : value;
}

function emptyValueToUndefined(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return value;
}

export function requiredTrimmedString(maxLength?: number) {
  let schema = z.string().trim().min(1);

  if (maxLength !== undefined) {
    schema = schema.max(maxLength);
  }

  return schema;
}

export function optionalTrimmedString(maxLength?: number) {
  let schema = z.string().trim();

  if (maxLength !== undefined) {
    schema = schema.max(maxLength);
  }

  return z.preprocess(nullToUndefined, schema.optional());
}

export function optionalNullableTrimmedString(maxLength?: number) {
  let schema = z.string().trim();

  if (maxLength !== undefined) {
    schema = schema.max(maxLength);
  }

  return schema.nullable().optional();
}

export function optionalString() {
  return z.preprocess(nullToUndefined, z.string().optional());
}

export function optionalPositiveInt() {
  return z.preprocess(
    emptyValueToUndefined,
    z.coerce.number().int().min(1).optional()
  );
}

export function optionalNonNegativeInt() {
  return z.preprocess(
    emptyValueToUndefined,
    z.coerce.number().int().min(0).optional()
  );
}

export function optionalBoolean() {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return value;
  }, z.boolean().optional());
}

export function optionalNullableBoolean() {
  return z.preprocess((value) => {
    if (value === undefined || value === "") {
      return undefined;
    }

    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return value;
  }, z.boolean().nullable().optional());
}
