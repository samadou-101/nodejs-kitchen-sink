import { http, HttpResponse } from "msw";

const BASE = "/api/ecom";

export const handlers = [
  http.get(`${BASE}/products`, () =>
    HttpResponse.json({
      success: true,
      data: [
        { id: 1, name: "Product 1", price: 1000, categoryId: 1 },
        { id: 2, name: "Product 2", price: 2000, categoryId: 1 },
      ],
      meta: { page: 1, limit: 20, total: 2 },
    }),
  ),

  http.get(`${BASE}/product/:id`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: { id: Number(params.id), name: `Product ${params.id}`, price: 1500, categoryId: 1 },
    }),
  ),

  http.get(`${BASE}/categories`, () =>
    HttpResponse.json({
      success: true,
      data: [
        { categoryId: 1, name: "Category 1" },
        { categoryId: 2, name: "Category 2" },
      ],
    }),
  ),

  http.post(`${BASE}/checkout`, () =>
    HttpResponse.json({
      success: true,
      data: { orderId: 1, orderStatusId: 1 },
    }),
  ),

  http.get(`${BASE}/orders/track`, ({ request }) => {
    const url = new URL(request.url);
    const phone = url.searchParams.get("phone");
    if (phone === "0550000000") {
      return HttpResponse.json({
        success: true,
        data: [
          {
            orderId: 1,
            customer: { name: "Test", phone, address: "Addr", email: "test@test.com" },
            orderItems: [{ productId: 1, price: 1000, quantity: 2 }],
            orderDate: new Date().toISOString(),
            orderStatusId: 1,
          },
        ],
      });
    }
    return HttpResponse.json({ success: true, data: [] });
  }),

  http.get(`${BASE}/orders/:id`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: {
        orderId: Number(params.id),
        customer: { name: "Test", phone: "0550000000", address: "Addr", email: "test@test.com" },
        orderItems: [{ productId: 1, price: 1000, quantity: 2 }],
        orderDate: new Date().toISOString(),
        orderStatusId: 1,
      },
    }),
  ),

  http.post(`${BASE}/admin/signup`, () =>
    HttpResponse.json({
      success: true,
      data: {
        userId: 1,
        employeeId: null,
        roleNames: ["ADMIN"],
        permissions: ["product:*", "order:*"],
        isSuperAdmin: false,
      },
    }),
  ),

  http.post(`${BASE}/admin/login`, () =>
    HttpResponse.json({
      success: true,
      data: {
        userId: 1,
        employeeId: null,
        roleNames: ["ADMIN"],
        permissions: ["product:*", "order:*"],
        isSuperAdmin: false,
      },
    }),
  ),

  http.post(`${BASE}/employee/login`, () =>
    HttpResponse.json({
      success: true,
      data: {
        userId: 2,
        employeeId: 1,
        roleNames: ["EMPLOYEE"],
        permissions: ["order:read", "order:update"],
        isSuperAdmin: false,
      },
    }),
  ),

  http.get(`${BASE}/employee/orders`, () =>
    HttpResponse.json({
      success: true,
      data: [
        {
          orderId: 1,
          customer: { name: "Test", phone: "0550000000", address: "Addr", email: "test@test.com" },
          orderItems: [{ productId: 1, price: 1000, quantity: 2 }],
          orderDate: new Date().toISOString(),
          orderStatusId: 1,
          employeeId: 1,
        },
      ],
    }),
  ),

  http.patch(`${BASE}/employee/orders/:id/confirm`, () =>
    HttpResponse.json({
      success: true,
      data: { success: true },
    }),
  ),

  http.patch(`${BASE}/employee/orders/:id/reject`, () =>
    HttpResponse.json({
      success: true,
      data: { success: true },
    }),
  ),

  http.post(`${BASE}/logout`, () =>
    HttpResponse.json({ success: true, data: null }),
  ),
];
