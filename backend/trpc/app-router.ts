import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import sendOtpRoute from "./routes/auth/send-otp/route";
import verifyOtpRoute from "./routes/auth/verify-otp/route";
import { registerProcedure } from "./routes/auth/register/route";
import { loginProcedure } from "./routes/auth/login/route";
import { getUserProfile, updateUserProfile } from "./routes/users/profile/route";
import createEventRoute from "./routes/events/create/route";
import listEventsRoute from "./routes/events/list/route";
import { joinEvent, getJoinedEvents } from "./routes/events/join/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    sendOtp: sendOtpRoute,
    verifyOtp: verifyOtpRoute,
    register: registerProcedure,
    login: loginProcedure,
  }),
  users: createTRPCRouter({
    getProfile: getUserProfile,
    updateProfile: updateUserProfile,
  }),
  events: createTRPCRouter({
    create: createEventRoute,
    list: listEventsRoute,
    join: joinEvent,
    getJoined: getJoinedEvents,
  }),
});

export type AppRouter = typeof appRouter;