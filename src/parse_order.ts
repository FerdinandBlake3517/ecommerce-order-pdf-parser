import { readFile } from "node:fs/promises";
import { parsePdf } from "./infrai_pdf.js";
import { modelOrder, orderUpdate } from "./order_parser.js";

const input = process.argv[2];
if (!input) {
  console.error("usage: npm run parse -- ./order.pdf");
  process.exit(2);
}
const pdf = (await readFile(input)).toString("base64");
const fields = await parsePdf(pdf);
const order = modelOrder(fields);
console.log(JSON.stringify({ checkout: { order_id: order.order_id, total: order.total }, fulfillment: order.fulfillment_status, receipt: order.fulfillment_status === "delivered", customer_update: orderUpdate(order) }, null, 2));
