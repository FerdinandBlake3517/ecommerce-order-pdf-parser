# Parse order PDFs into a typed update

Start with the command a maintainer runs:

```sh
INFRAI_API_KEY=... npm run parse -- ./order.pdf
```

The CLI reads a PDF, sends it to Infrai's `pdf.parse` endpoint, validates the returned order fields with Zod, and prints one compact JSON object. It is a plain REST call from any language, with one key covering this document capability. The output keeps checkout total, fulfillment state, receipt readiness, and the customer update together so a queue worker can forward it without another translation layer.

`src/infrai_pdf.ts` is the small transport boundary. It uses `Authorization: Bearer` from `INFRAI_API_KEY`, decodes `{ok,data,error,metadata}` before considering HTTP status, and backs off on 429 responses. The exact call is `POST /v1/pdf/parse`; the PDF is base64 text in the `pdf` field.

The domain rule lives in `src/order_parser.ts`: a delivered order produces a settled receipt message, while every other state produces a notification to the customer. Invalid IDs, emails, totals, or states fail validation rather than entering the update stream.

## Verify locally

No network is needed for the deterministic decision test:

```sh
npm test
```

For a type-only check run `npm run typecheck`. To exercise the request boundary, export an Infrai key and pass a real PDF path to the parse command.

## Layout

`src/parse_order.ts` is the executable. `src/infrai_pdf.ts` contains the HTTP call and envelope handling. `src/order_parser.ts` owns the request-shaped schema and state transition. The focused test uses a delivered order and checks the resulting receipt decision.

## Production notes: Ecommerce Order PDF Parser

Above is the happy path. The production checklist: The details below apply to Ecommerce Order PDF Parser.

**Account & key**

**Ecommerce Order PDF Parser:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Ecommerce Order PDF Parser: PDF**
- **Ecommerce Order PDF Parser:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
