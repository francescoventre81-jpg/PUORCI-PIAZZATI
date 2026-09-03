import {
  sendUrgentDeadlineEmail,
  sendRegistrationReminderEmail,
  sendWelcomeRegistrationEmail,
} from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

type ClaimedEmail = {
  user_id: string;
  email: string;
  first_name: string;
  claimed_at: string;
};

type EmailKind = "welcome" | "reminder" | "urgent_deadline";

type ProcessOptions = {
  userId?: string;
  includeReminders?: boolean;
  maxJobs?: number;
};

async function finishJob(
  job: ClaimedEmail,
  emailKind: EmailKind,
  delivered: boolean,
) {
  const admin = createAdminClient();
  const functionName = delivered
    ? "complete_registration_email_job"
    : "release_registration_email_job";
  const { error } = await admin.rpc(functionName, {
    target_user_id_value: job.user_id,
    email_kind_value: emailKind,
    claimed_at_value: job.claimed_at,
  });

  if (error) throw error;
}

async function deliverJobs(jobs: ClaimedEmail[], emailKind: EmailKind) {
  let sent = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      const delivered =
        emailKind === "welcome"
          ? await sendWelcomeRegistrationEmail(job.email, job.first_name)
          : emailKind === "reminder"
            ? await sendRegistrationReminderEmail(job.email, job.first_name)
            : await sendUrgentDeadlineEmail(job.email, job.first_name);

      await finishJob(job, emailKind, delivered);
      if (delivered) sent += 1;
      else failed += 1;
    } catch {
      failed += 1;
      await finishJob(job, emailKind, false).catch(() => undefined);
    }
  }

  return { sent, failed };
}

export async function processRegistrationEmailAutomation({
  userId,
  includeReminders = true,
  maxJobs = 50,
}: ProcessOptions = {}) {
  const admin = createAdminClient();
  const boundedMaxJobs = Math.max(1, Math.min(maxJobs, 100));
  const { data: welcomeJobs, error: welcomeError } = await admin.rpc(
    "claim_welcome_registration_emails",
    {
      target_user_id_value: userId ?? null,
      max_jobs_value: boundedMaxJobs,
    },
  );

  if (welcomeError) throw welcomeError;

  const welcome = await deliverJobs(
    (welcomeJobs ?? []) as ClaimedEmail[],
    "welcome",
  );

  if (!includeReminders || userId) {
    return { welcome, reminder: { sent: 0, failed: 0 } };
  }

  const { data: reminderJobs, error: reminderError } = await admin.rpc(
    "claim_registration_reminders",
    { max_jobs_value: boundedMaxJobs },
  );

  if (reminderError) throw reminderError;

  const reminder = await deliverJobs(
    (reminderJobs ?? []) as ClaimedEmail[],
    "reminder",
  );

  const promotionDeadline = new Date("2026-08-10T23:59:59+02:00");
  if (Date.now() > promotionDeadline.getTime()) {
    return { welcome, reminder, promotionDeadline: { sent: 0, failed: 0 } };
  }

  const { data: urgentJobs, error: urgentError } = await admin.rpc(
    "claim_urgent_deadline_emails",
    { max_jobs_value: boundedMaxJobs },
  );

  if (urgentError) throw urgentError;

  const urgent = await deliverJobs(
    (urgentJobs ?? []) as ClaimedEmail[],
    "urgent_deadline",
  );

  return { welcome, reminder, promotionDeadline: urgent };
}
