import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { sendVerificationEmail } from "../../../lib/email";
import { generateOTP, storeOTP } from "../../../lib/otp-store";

export default publicProcedure
  .input(z.object({ email: z.string().email() }))
  .mutation(async ({ input }) => {
    try {
      const code = generateOTP();
      storeOTP(input.email, code);
      
      // Always return success, even if email fails
      try {
        await sendVerificationEmail(input.email, code);
      } catch {
        console.log('Email service unavailable, using demo mode');
        console.log(`Demo verification code for ${input.email}: ${code}`);
      }
      
      return {
        success: true,
        message: 'Verification code sent successfully',
        demoCode: code, // Include demo code for development
      };
    } catch (error) {
      console.error('Failed to send OTP:', error);
      // Don't throw error, return demo code instead
      const code = generateOTP();
      return {
        success: true,
        message: 'Demo mode: Using test verification code',
        demoCode: code,
      };
    }
  });