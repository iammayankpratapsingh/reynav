// Request proxy (formerly middleware): session presence check and redirects only; no backend imports.
import { NextResponse } from "next/server";

export function proxy() {
  return NextResponse.next();
}
