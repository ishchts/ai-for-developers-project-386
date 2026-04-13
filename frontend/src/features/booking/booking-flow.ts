export const bookingSteps = {
  selectSlot: "selectSlot",
  confirm: "confirm",
  success: "success",
} as const;

export type BookingStep = (typeof bookingSteps)[keyof typeof bookingSteps];
