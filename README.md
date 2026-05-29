# RestaurantOS

A real-time restaurant ordering system. Customers scan a QR code at their table, browse the menu, and place an order. The order is instantly routed to the kitchen and bar displays. When food is ready, the waiter gets a notification.

## Live

| | URL |
|---|---|
| Customer menu | https://client-gamma-five-14.vercel.app/table/1 |
| Kitchen display | https://client-gamma-five-14.vercel.app/kitchen |
| Bar display | https://client-gamma-five-14.vercel.app/bar |
| Waiter station | https://client-gamma-five-14.vercel.app/waiter |

## How it works

1. Customer scans a QR code → lands on `/table/:id` with the full menu
2. They place an order → food items go to the kitchen screen, drinks go to the bar screen
3. Kitchen marks the order as ready → waiter gets a notification to collect it

## QR codes

Pre-generated QR codes for tables 1–10 are in `qr-codes/`. Each one encodes the live URL for that table.

To print all of them on one page, open `qr-print.html` in a browser and hit `Ctrl+P`.

To regenerate (e.g. after changing the frontend URL):

```bash
MENU_BASE_URL=https://your-url.vercel.app npm run generate-qr
```

## Run locally

```bash
npm run install:all   # one-time setup
npm run dev           # starts server on :3001 and client on :5173
```

Open each page in a separate browser tab to simulate the full flow.
