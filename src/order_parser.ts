import { z } from "zod";

const orderSchema = z.object({
  order_id: z.string().min(1),
  customer_email: z.string().email(),
  total: z.number().nonnegative(),
  fulfillment_status: z.enum(["pending", "packed", "shipped", "delivered"]).default("pending")
});

export type Order = z.infer<typeof orderSchema>;

export function modelOrder(fields: Record<string, unknown>): Order {
  return orderSchema.parse({
    order_id: fields.order_id ?? fields.orderNumber,
    customer_email: fields.customer_email ?? fields.email,
    total: Number(fields.total ?? fields.amount),
    fulfillment_status: fields.fulfillment_status ?? "pending"
  });
}

export function orderUpdate(order: Order): string {
  if (order.fulfillment_status === "delivered") return `Receipt ${order.order_id} settled for ${order.customer_email}`;
  return `Order ${order.order_id} is ${order.fulfillment_status}; notify ${order.customer_email}`;
}
