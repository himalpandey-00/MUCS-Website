"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120, "Name is too long."),
  email: z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address.").max(200),
  subject: z.string().trim().max(150, "Subject is too long.").optional(),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters.")
    .max(5000, "Message is too long."),
});

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "subject" | "message", string[]>>;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot field — visually hidden in the form, so only bots fill it in.
  // Pretend success without touching the database or tipping the bot off.
  if (formData.get("company")) {
    return { status: "success", message: "Thanks — we'll get back to you soon." };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, subject, message } = parsed.data;

  try {
    await prisma.contactSubmission.create({
      data: { name, email, subject: subject || null, message },
    });
  } catch (error) {
    console.error("Failed to save contact submission:", error);
    return {
      status: "error",
      message: "Something went wrong sending your message — please try emailing us directly instead.",
    };
  }

  return { status: "success", message: "Thanks — we'll get back to you soon." };
}
