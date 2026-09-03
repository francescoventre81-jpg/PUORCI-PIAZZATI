import {
  sendRegistrationConfirmationEmail,
  sendRewardEmail,
} from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

type ConfirmationResult = {
  registration_id?: string;
  reward_created?: boolean;
  reward_code?: string | null;
  reward_owner_registration_id?: string | null;
};

export async function deliverConfirmationEmails(result: ConfirmationResult) {
  const admin = createAdminClient();
  let confirmationSent = false;
  let rewardSent = false;

  if (result.registration_id) {
    const { data: registration } = await admin
      .from("registrations")
      .select(
        "id,email,first_name,payment_method,personal_referral_code,confirmation_email_sent_at,amount_paid_cents",
      )
      .eq("id", result.registration_id)
      .single();

    if (
      registration &&
      !registration.confirmation_email_sent_at &&
      registration.personal_referral_code
      && registration.amount_paid_cents
    ) {
      const claimedAt = new Date().toISOString();
      const { data: claimed } = await admin
        .from("registrations")
        .update({ confirmation_email_sent_at: claimedAt })
        .eq("id", registration.id)
        .is("confirmation_email_sent_at", null)
        .select("id");

      if (claimed?.length) {
        try {
          const sent = await sendRegistrationConfirmationEmail({
            email: registration.email,
            firstName: registration.first_name,
            paymentMethod: registration.payment_method,
            referralCode: registration.personal_referral_code,
            amountPaidCents: registration.amount_paid_cents,
          });
          confirmationSent = sent;
          if (!sent) {
            await admin
              .from("registrations")
              .update({ confirmation_email_sent_at: null })
              .eq("id", registration.id)
              .eq("confirmation_email_sent_at", claimedAt);
          }
        } catch (error) {
          await admin
            .from("registrations")
            .update({ confirmation_email_sent_at: null })
            .eq("id", registration.id)
            .eq("confirmation_email_sent_at", claimedAt);
          throw error;
        }
      }
    }
  }

  if (
    result.reward_created &&
    result.reward_owner_registration_id &&
    result.reward_code
  ) {
    const { data: owner } = await admin
      .from("registrations")
      .select("email,first_name")
      .eq("id", result.reward_owner_registration_id)
      .single();
    const { data: reward } = await admin
      .from("referral_rewards")
      .select("id,congratulations_email_sent_at")
      .eq("owner_registration_id", result.reward_owner_registration_id)
      .single();

    if (owner && reward && !reward.congratulations_email_sent_at) {
      const claimedAt = new Date().toISOString();
      const { data: claimed } = await admin
        .from("referral_rewards")
        .update({ congratulations_email_sent_at: claimedAt })
        .eq("id", reward.id)
        .is("congratulations_email_sent_at", null)
        .select("id");

      if (claimed?.length) {
        try {
          const sent = await sendRewardEmail(
            owner.email,
            owner.first_name,
            result.reward_code,
          );
          rewardSent = sent;
          if (!sent) {
            await admin
              .from("referral_rewards")
              .update({ congratulations_email_sent_at: null })
              .eq("id", reward.id)
              .eq("congratulations_email_sent_at", claimedAt);
          }
        } catch (error) {
          await admin
            .from("referral_rewards")
            .update({ congratulations_email_sent_at: null })
            .eq("id", reward.id)
            .eq("congratulations_email_sent_at", claimedAt);
          throw error;
        }
      }
    }
  }

  return { confirmationSent, rewardSent };
}
