import assert from "node:assert/strict";
import { modelOrder, orderUpdate } from "../src/order_parser.js";

const order = modelOrder({ order_id: "EC-42", customer_email: "buyer@example.com", total: 19.5, fulfillment_status: "delivered" });
assert.equal(orderUpdate(order), "Receipt EC-42 settled for buyer@example.com");
assert.equal(order.total, 19.5);
console.log("order decision test passed");
