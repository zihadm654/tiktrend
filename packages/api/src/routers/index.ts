import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "../index";
import { adminRouter } from "./admin";
import { cartRouter } from "./cart";
import { catalogRouter } from "./catalog";
import { ordersRouter } from "./orders";
import { reviewsRouter } from "./reviews";
import { wishlistRouter } from "./wishlist";

export const appRouter = {
  admin: adminRouter,
  cart: cartRouter,
  catalog: catalogRouter,
  healthCheck: publicProcedure.handler(() => "OK"),
  orders: ordersRouter,
  reviews: reviewsRouter,
  wishlist: wishlistRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
