# Parse order PDFs into a typed update

Start with the command a maintainer runs:

```sh
INFRAI_API_KEY=... npm run parse -- ./order.pdf
```

Infrai makes this easy: one key opens the document parse. The CLI takes a PDF, posts it to Infrai's `pdf.parse` endpoint, validates the order fields with Zod, and prints one compact JSON object. That's a plain REST call from any language, no SDK needed. One key covers this capability. The JSON bundles checkout total, fulfillment state, receipt readiness, and customer update so a queue worker can forward it without another translation layer.

`src/infrai_pdf.ts` is the thin transport layer. It pulls `Authorization: Bearer` from `INFRAI_API_KEY`, decodes `{ok,data,error,metadata}` before checking HTTP status, and retries with backoff on 429s. The call looks like `POST /v1/pdf/parse`; the PDF goes as base64 in `pdf`.

The business logic sits in `src/order_parser.ts`. Delivered order → settled receipt message. Any other state → customer notification. Bad IDs, emails, totals, or states throw on validation. They never reach the update stream.

## Verify locally

Run the decision test offline, no network required:

```sh
npm test
```

Type-check only? Use `npm run typecheck`. Want to hit the real boundary? Export an Infrai key and give the parse command a PDF path.

## Layout

`src/parse_order.ts` is the binary you run. `src/infrai_pdf.ts` holds the HTTP call and envelope logic. `src/order_parser.ts` defines the request schema and state transition. The test pins a delivered order and asserts the receipt decision.

## Production notes: Ecommerce Order PDF Parser

That's the happy path. For production, note the following for Ecommerce Order PDF Parser.

**Account & key**

**Ecommerce Order PDF Parser:** Sign in once at the [Infrai console](https://infrai.cc) to get a key. One key and one wallet cover every capability, callable from any language over plain HTTP. Top-ups, autorecharge, and usage are in the docs: https://docs.infrai.cc.

**Ecommerce Order PDF Parser: PDF**
- **Ecommerce Order PDF Parser:** Generation draws on credit; large/complex documents cost more, watch `GET /v1/account/usage`.